import json
import os
import time
import shutil
from helpers.neural_nets import start_training
import traceback
from jsonschema import validate


EXAMPLE_OUTPUT_FUNCTION = """
from ...backend.helpers.main import DataObj
import numpy as np

def output_function(input: DataObj) -> np.ndarray:
    return input.np_array / 2
"""

PROJECT_SCHEMA_PATH = "./schema/project_schema.json"
with open(PROJECT_SCHEMA_PATH, 'r') as f:
    project_schema = json.load(f)

DEFAULT_CONFIG = { 'name': "DEFAULT", "hidden_layers": [{"size": [100], "type":"Dense"}], 'epochs': 10 }
validate(DEFAULT_CONFIG, project_schema)

def estimate_training_time(total_nodes: int, num_epochs: int, num_training_samples: int = 1000, time_per_unit: float = 1e-4) -> float:
    total_computations = total_nodes * num_training_samples * num_epochs
    estimated_time = total_computations * time_per_unit
    
    return estimated_time

def create_project_files():
    try:
        os.mkdir('./project_files')
    except OSError:
        pass

def get_projects() -> list[str]:
    create_project_files()
    files = os.listdir('./project_files')
    return files

def get_project_config(project_name: str) -> dict:
    with open(f'./project_files/{project_name}/config.json', 'r') as f:
        data = json.load(f)
    validate(data, project_schema)
    return data

def new_project(project_name: str):
    this_config = DEFAULT_CONFIG.copy()
    this_config['name'] = project_name
    create_project_files()
    try:
        os.mkdir(f'./project_files/{project_name}')
        with open(f'./project_files/{project_name}/config.json', 'w') as f:
            json.dump(this_config, f)
        return "completed", 200
    except OSError or PermissionError as e:
        return f"Error: {e}", 500
    
def set_project_config(config: dict):
    name = config['name']
    output_based = config['input']['type'] == 'Function of the output'
    with open(f'./project_files/{name}/config.json', 'w') as f:
        json.dump(config, f)
    if output_based and not os.path.exists(f'./project_files/{name}/output_function.py'):
        with open(f'./project_files/{name}/output_function.py', 'w') as f:
            f.write(EXAMPLE_OUTPUT_FUNCTION)
    
def delete_project(project_name: str):
    create_project_files()
    try:
        shutil.rmtree(f'./project_files/{project_name}')
        return "completed", 200
    except OSError or PermissionError as e:
        return f"Error: {e}", 500
    
def train_project(project_name: str):
    config = get_project_config(project_name)
    total_nodes = 0
    for layer in config['hidden_layers']:
        if layer['type'] == 'Dense':
            total_nodes += layer['size'][0]
        elif layer['type'] == 'Convolution':
            total_nodes += layer['size'][0] * layer['size'][1] * layer['config']['filters']
    num_epochs = config['epochs']
    time_estimate = estimate_training_time(total_nodes, num_epochs)
    print(f"Training project {project_name}. \nEstimated training time: {time_estimate} seconds. \nEstimated time of completion: {time.ctime(time.time() + time_estimate)}")
    try:
        start_training(
            config,
        )
    except Exception:
        tb = traceback.format_exc()
        print(tb)
        return {"error":tb}, 500
    return {"data":"completed"}, 200

def has_associated_model(project_name: str) -> bool:
    return os.path.exists(f'./project_files/{project_name}/{project_name}.keras')