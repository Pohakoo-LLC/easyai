import numpy as np
from transformers import AutoTokenizer, AutoModel
import torch

def text_to_embedding(text, model_name="meta-llama/Meta-Llama-3.1-8B"):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name)
    
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    
    embeddings = outputs.last_hidden_state
    embeddings_array = embeddings.numpy()
    averaged_embeddings = np.mean(embeddings_array, axis=1)
    return averaged_embeddings

typeConversions = {
    "Color Image": "img_col",
    "Black and White Image": "img_bw",
    "Audio": "audio",
    "Text": "text",
    "Identification": "id",
    "Other": "other"
}

class OutputObj:
    def __init__(self, out_type, data_path_or_desired_output:str|None = None) -> None:
        self.type = typeConversions[out_type]
        self.data_path_or_desired_output = data_path_or_desired_output
        self.np_array = None

        if self.type == 'other':
            array = np.load(data_path_or_desired_output)
            self.np_array = array
        elif self.type == 'img_col' or self.type == 'img_bw' or self.type == 'audio' or self.type == 'other':
            self.np_array = np.load(data_path_or_desired_output)
        elif self.type == 'text':
            self.np_array = text_to_embedding(data_path_or_desired_output)
        elif self.type == 'id':
            self.np_array = np.array(data_path_or_desired_output)

        self.shape = self.np_array.shape
