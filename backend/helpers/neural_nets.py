import numpy as np
import json
import torch
from transformers import AutoTokenizer, AutoModel
import tensorflow as tf
import keras.api as keras
from keras.api import layers, models
from keras.api.utils import to_categorical
import os
from PIL import Image
from typing import Optional, Dict, Tuple
from enum import Enum
import platform

def get_app_storage_path():
    """
    Returns an appropriate storage path based on the operating system.
    
    :param app_name: The name of the application (used to create the directory).
    :return: An absolute path string.
    """
    system = platform.system()
    app_name = "Pohakoo/EasyAI"
    
    if system == 'Windows':
        # Windows: Use the AppData folder for the current user
        base_path = os.getenv('APPDATA', 'C:/Program Files')
        return os.path.join(base_path, app_name)
    
    elif system == 'Darwin':
        # macOS: Use ~/Library/Application Support for the current user
        base_path = os.path.expanduser('~/Library/Application Support')
        return os.path.join(base_path, app_name)
    
    elif system == 'Linux':
        # Linux: Use ~/.local/share for the current user
        base_path = os.path.expanduser('~/.local/share')
        return os.path.join(base_path, app_name)
    
    else:
        raise OSError(f"Unsupported operating system: {system}")

def root(path:str):
    return os.path.join(get_app_storage_path(), path)

class DataType(Enum):
    COLOR_IMAGE = "img_col"
    BLACK_AND_WHITE_IMAGE = "img_bw"
    AUDIO = "audio"
    TEXT = "text"
    IDENTIFICATION = "id"
    OTHER = "other"

class TextEmbedder:
    def __init__(self, model_name: str = "distilbert-base-uncased"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

    def text_to_embedding(self, text: str) -> np.ndarray:
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
        embeddings = outputs.last_hidden_state.cpu().numpy()
        return np.mean(embeddings, axis=1)

class DataObj:
    def __init__(self, out_type: DataType, data_path_or_desired_output: Optional[str] = None, labels_path: Optional[str] = None) -> None:
        self.type = out_type
        self.data_path_or_desired_output = os.path.join(os.path.dirname(labels_path), data_path_or_desired_output) if labels_path else data_path_or_desired_output
        self.np_array = self._process_data()
        self.shape = self.np_array.shape

    def _process_data(self) -> np.ndarray:
        if self.type in [DataType.OTHER, DataType.AUDIO]:
            return np.load(self.data_path_or_desired_output, allow_pickle=True)
        elif self.type == DataType.COLOR_IMAGE:
            return np.array(Image.open(self.data_path_or_desired_output).convert('RGB'), dtype=np.float32) / 255.0
        elif self.type == DataType.BLACK_AND_WHITE_IMAGE:
            return np.expand_dims(np.array(Image.open(self.data_path_or_desired_output).convert('L'), dtype=np.float32) / 255.0, axis=-1)
        elif self.type == DataType.TEXT:
            return text_embedder.text_to_embedding(self.data_path_or_desired_output)
        elif self.type == DataType.IDENTIFICATION:
            return self._process_identification()
        else:
            raise ValueError(f"Unsupported data type: {self.type}")

    def _process_identification(self) -> np.ndarray:
        with open(self.data_path_or_desired_output, "r") as f:
            training_index = json.load(f)
        unique_labels = sorted(set(training_index.values()))
        label_to_index = {label: idx for idx, label in enumerate(unique_labels)}
        np_array = np.zeros(len(unique_labels))
        if self.data_path_or_desired_output in label_to_index:
            np_array[label_to_index[self.data_path_or_desired_output]] = 1
        else:
            raise ValueError(f"Label {self.data_path_or_desired_output} not found in labels.")
        return np_array

class DataGenerator(keras.utils.Sequence):
    def __init__(self, config: Dict, batch_size: int = 32):
        self.config = config
        self.batch_size = batch_size
        self.input_type = DataType[config["input"]["type"].upper().replace(" ", "_")]
        with open(config["training_data_path"], "r") as f:
            self.training_index = json.load(f)
        self.data_paths = list(self.training_index.keys())
        self.labels = [str(label) for label in self.training_index.values()]  # Convert all labels to strings
        self.unique_labels = sorted(set(self.labels))  # Now sorting works correctly
        self.label_to_index = {label: idx for idx, label in enumerate(self.unique_labels)}

    def __len__(self):
        return int(np.ceil(len(self.data_paths) / float(self.batch_size)))

    def __getitem__(self, idx):
        batch_paths = self.data_paths[idx * self.batch_size:(idx + 1) * self.batch_size]
        batch_labels = self.labels[idx * self.batch_size:(idx + 1) * self.batch_size]

        X = np.array([DataObj(self.input_type, path, self.config["training_data_path"]).np_array for path in batch_paths])
        y = np.array([self.label_to_index[label] for label in batch_labels])

        return X, to_categorical(y, num_classes=len(self.unique_labels))

def create_model(config: Dict, input_shape: Tuple[int, ...], num_classes: int) -> keras.Model:
    model = models.Sequential()
    
    for i, layer_config in enumerate(config["hidden_layers"]):
        layer_type = layer_config["type"]
        layer_size = layer_config["size"]
        
        if i == 0:
            if len(layer_size) == 1:
                model.add(layers.Dense(layer_size[0], activation='relu', input_shape=input_shape))
            elif len(layer_size) == 2:
                model.add(layers.Conv2D(layer_config["config"]["filters"], layer_size, activation=layer_config["config"]["activation"].lower(), input_shape=input_shape))
            elif len(layer_size) == 3:
                model.add(layers.Conv3D(layer_config["config"]["filters"], layer_size, activation=layer_config["config"]["activation"].lower(), input_shape=input_shape))
        else:
            if layer_type == "Dense":
                model.add(layers.Dense(layer_size[0], activation='relu'))
            elif layer_type == "Convolution":
                if len(layer_size) == 1:
                    model.add(layers.Conv1D(layer_config["config"]["filters"], layer_size[0], activation=layer_config["config"]["activation"].lower()))
                elif len(layer_size) == 2:
                    model.add(layers.Conv2D(layer_config["config"]["filters"], layer_size, activation=layer_config["config"]["activation"].lower()))
                elif len(layer_size) == 3:
                    model.add(layers.Conv3D(layer_config["config"]["filters"], layer_size, activation=layer_config["config"]["activation"].lower()))
            elif layer_type == "Max pooling":
                if len(layer_size) == 1:
                    model.add(layers.MaxPooling1D(layer_size[0]))
                elif len(layer_size) == 2:
                    model.add(layers.MaxPooling2D(layer_size))
                elif len(layer_size) == 3:
                    model.add(layers.MaxPooling3D(layer_size))
        
        if i < len(config["hidden_layers"]) - 1:
            next_layer_config = config["hidden_layers"][i + 1]
            if len(layer_size) > len(next_layer_config['size']):
                model.add(layers.Flatten())
            elif len(layer_size) < len(next_layer_config['size']):
                if len(next_layer_config['size']) == 2:
                    model.add(layers.Reshape((layer_size[0], layer_size[0], 1)))
                elif len(next_layer_config['size']) == 3:
                    model.add(layers.Reshape((layer_size[0], layer_size[0], layer_size[0], 1)))

    model.add(layers.Flatten())
    model.add(layers.Dense(num_classes, activation='softmax'))

    return model

def start_training(config: Dict, batch_size: int = 32):
    data_generator = DataGenerator(config, batch_size)
    sample_data = data_generator[0][0]
    input_shape = sample_data.shape[1:]
    num_classes = len(data_generator.unique_labels)

    model = create_model(config, input_shape, num_classes)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    try:
        model.fit(data_generator, epochs=config["epochs"])
    except Exception as e:
        print(f"Error during model training: {e}")
        return

    project_path = os.path.join(root("/project_files"), config["name"])
    os.makedirs(project_path, exist_ok=True)
    model_path = os.path.join(project_path, f"{config['name']}.keras")
    model.save(model_path)
    print(f"Model saved to {model_path}")

def predict(data_path: str, model_path: str, config: Dict):
    model = models.load_model(model_path)
    input_type = DataType[config["input"]["type"].upper().replace(" ", "_")]
    input_obj = DataObj(input_type, data_path)
    input_data = np.expand_dims(input_obj.np_array, axis=0)  # Add batch dimension
    predictions = model.predict(input_data)

    if config["output"]["type"] == "Identification":
        with open(config["training_data_path"], "r") as f:
            training_index = json.load(f)
        unique_labels = sorted(set(str(label) for label in training_index.values()))  # Convert to strings here as well
        index_to_label = {idx: label for idx, label in enumerate(unique_labels)}
        prediction = index_to_label[np.argmax(predictions)]
    else:
        prediction = predictions

    return prediction

# Global text embedder
text_embedder = TextEmbedder()