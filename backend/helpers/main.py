import numpy as np
import json
from transformers import AutoTokenizer, AutoModel
import torch
from keras.api import models, layers
from keras.api.utils import to_categorical
import os
from PIL import Image
from typing import Optional

# Converts text input to an embedding using a pretrained transformer model
def text_to_embedding(text, model_name="meta-llama/Meta-Llama-3.1-8B"):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name)

    # Move model to GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(device)
    
    with torch.no_grad():
        outputs = model(**inputs)

    # Move embeddings back to CPU for further processing
    embeddings = outputs.last_hidden_state.cpu().numpy()
    averaged_embeddings = np.mean(embeddings, axis=1)
    return averaged_embeddings

# Dictionary to convert human-readable types to internal codes
typeConversions = {
    "Color Image": "img_col",
    "Black and White Image": "img_bw",
    "Audio": "audio",
    "Text": "text",
    "Identification": "id",
    "Other": "other"
}

# A class that represents different types of data inputs and converts them to numpy arrays
class OutputObj:
    def __init__(self, out_type: str, data_path_or_desired_output: Optional[str] = None, labels_path: Optional[str] = None) -> None:
        # Determine the type of the data based on the input
        if out_type not in typeConversions:
            raise ValueError(f"Unsupported output type: {out_type}")
        self.type = typeConversions[out_type]
        
        # If labels_path is provided, join it with the data path
        if labels_path is not None:
            self.data_path_or_desired_output = os.path.join(os.path.dirname(labels_path), data_path_or_desired_output).replace("\\", "/")
        else:
            self.data_path_or_desired_output = data_path_or_desired_output
        
        self.np_array = None

        # Load and process the input data based on the type
        if self.type in ['other', 'audio']:
            self.np_array = np.load(self.data_path_or_desired_output, allow_pickle=True)
        elif self.type == 'img_col':
            image = Image.open(self.data_path_or_desired_output).convert('RGB')  # Ensure color
            self.np_array = np.array(image, dtype=np.float32) / 255.0  # Normalize to [0, 1] and ensure float32 type
        elif self.type == 'img_bw':
            image = Image.open(self.data_path_or_desired_output).convert('L')  # Ensure grayscale
            self.np_array = np.array(image, dtype=np.float32) / 255.0  # Normalize and convert to float32
            self.np_array = np.expand_dims(self.np_array, axis=-1)  # Add the channel dimension (28, 28) -> (28, 28, 1)
        elif self.type == 'text':
            self.np_array = text_to_embedding(self.data_path_or_desired_output)
        elif self.type == 'id':
            self._process_identification(labels_path, data_path_or_desired_output)
        
        # Store the shape of the numpy array
        self.shape = self.np_array.shape

    # Process identification data and convert it to a one-hot encoded vector
    def _process_identification(self, labels_path, label_key):
        with open(labels_path, "r") as f:
            training_index = json.load(f)
        
        unique_labels = sorted(set(training_index.values()))
        label_to_index = {label: idx for idx, label in enumerate(unique_labels)}
        
        self.np_array = np.zeros(len(unique_labels))
        if label_key in label_to_index:
            self.np_array[label_to_index[label_key]] = 1
        else:
            raise ValueError(f"Label {label_key} not found in labels.")

# Function to load, preprocess data, build and train a model based on the config
def start_training(config: dict, batch_size: int = 32):
    # Load training labels from JSON
    with open(config["training_data_path"], "r") as f:
        training_index = json.load(f)

    # Get input and output types
    input_type = config["input"]["type"]
    output_type = config["output"]["type"]
    epochs = config["epochs"]

    # Initialize lists for training data and labels
    X_train, y_train = [], []

    # Load data according to the input type, and extract labels
    for data_path, label in training_index.items():
        input_obj = OutputObj(input_type, data_path, labels_path=config["training_data_path"])
        X_train.append(input_obj.np_array)
        y_train.append(int(label))  # Ensure labels are treated as integers

    # Convert lists to numpy arrays
    X_train = np.array(X_train)
    y_train = np.array(y_train)

    # Remove unnecessary expansion for grayscale images, ensure only one channel dimension
    if input_type == "Black and White Image":
        X_train = np.squeeze(X_train, axis=-1)  # Remove the last dimension if it's 1
        X_train = np.expand_dims(X_train, axis=-1)  # Ensure shape is (batch_size, height, width, 1)

    # One-hot encode the labels
    y_train = to_categorical(y_train)

    # Build the model using the configuration provided
    model = models.Sequential()
    input_shape = X_train.shape[1:]  # Get input shape from data, e.g., (height, width, channels)

    # Add hidden layers based on config
    for layer_config in config["hidden_layers"]:
        layer_type = layer_config["type"]
        
        if layer_type == "Convolution":
            model.add(layers.Conv2D(layer_config["config"]["filters"],
                                    layer_config["size"],
                                    activation=layer_config["config"]["activation"].lower(),
                                    input_shape=input_shape))
        elif layer_type == "Max pooling":
            model.add(layers.MaxPooling2D(layer_config["size"]))
        elif layer_type == "Dense":
            model.add(layers.Dense(layer_config["size"][0], activation='relu'))
        
        input_shape = None  # Input shape only needed for the first layer

    model.add(layers.Flatten())  # Flatten for fully connected layers
    model.add(layers.Dense(y_train.shape[1], activation='softmax'))  # Output layer with softmax

    # Compile the model with appropriate loss function and optimizer
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # Train the model
    try:
        model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size)
    except Exception as e:
        print(f"Error during model training: {e}")

    # Save the trained model
    dist = os.path.join(os.path.dirname(config["training_data_path"]), f"{config['name']}.keras")
    model.save(dist)

# Function to make predictions on new data using a trained model
def predict(data_path: str, model_path: str, config: dict):
    # Load the model
    model = models.load_model(model_path)

    # Load the data
    input_obj = OutputObj(config["input"]["type"], data_path)

    # Ensure the input data has the correct shape
    input_data = np.expand_dims(input_obj.np_array, axis=0)  # Add batch dimension

    # Make predictions
    predictions = model.predict(input_data)

    # Convert predictions to human-readable format
    if config["output"]["type"] == "Identification":
        with open(config["training_data_path"], "r") as f:
            training_index = json.load(f)
        
        # Convert all labels to strings for consistent sorting
        unique_labels = sorted(set(str(label) for label in training_index.values()))
        label_to_index = {label: idx for idx, label in enumerate(unique_labels)}
        index_to_label = {idx: label for label, idx in label_to_index.items()}
        
        prediction = index_to_label[np.argmax(predictions)]
    else:
        prediction = predictions

    return prediction
