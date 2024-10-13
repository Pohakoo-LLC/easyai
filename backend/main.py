import json
import os
import time
import shutil
from flask import Flask, request
from flask_cors import CORS
from helpers.main import start_training, predict
import traceback

app = Flask(__name__)
app.logger.disabled = False
app.logger.setLevel('INFO')
CORS(app)

EXAMPLE_OUTPUT_FUNCTION = """
from ...backend.helpers.main import OutputObj
import numpy as np

def output_function(input: OutputObj) -> np.ndarray:
    return input.np_array / 2
"""

def estimate_training_time(total_nodes: int, num_training_samples: int, num_epochs: int, time_per_unit: float = 1e-6) -> float:
    """
    Estimate the training time for a neural network.
    
    Parameters:
    - total_nodes (int): Total number of nodes in the whole network.
    - num_training_samples (int): Number of training samples.
    - num_epochs (int): Number of epochs.
    - time_per_unit (float): Time taken to process one unit of work (default: 1e-6 seconds).
    
    Returns:
    - float: Estimated training time in seconds.
    """
    # Total computations = number of nodes * number of samples * number of epochs
    total_computations = total_nodes * num_training_samples * num_epochs
    
    # Estimated training time
    estimated_time = total_computations * time_per_unit
    
    return estimated_time

# Example usage
nodes = 1000  # Example: total nodes in the network
samples = 50000  # Example: number of training samples
epochs = 10  # Example: number of epochs
time_per_unit = 2e-6  # Example: estimated time per unit (based on hardware)

estimated_time = estimate_training_time(nodes, samples, epochs, time_per_unit)
print(f"Estimated training time: {estimated_time} seconds")

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
    return data

def new_project(project_name: str):
    create_project_files()
    try:
        os.mkdir(f'./project_files/{project_name}')
        with open(f'./project_files/{project_name}/config.json', 'w') as f:
            json.dump({
                'name': project_name,
                "hidden_layers": [{"size": [100], "type":"Dense"}],
                'epochs': 10,
            }, f)
        return "completed", 200
    except OSError or PermissionError as e:
        return f"Error: {e}", 500
    
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
    num_training_samples = 1000
    num_epochs = config['epochs']
    time_estimate = estimate_training_time(total_nodes, num_training_samples, num_epochs)
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

@app.route('/get_projects', methods=['GET'])
def handle_get_projects():
    projects = get_projects()
    return {'data':projects}

@app.route('/new_project', methods=['POST'])
def handle_new_project():
    name = request.json['data']
    status, code = new_project(name)
    return {'data':str(status)}, code

@app.route('/delete_project', methods=['POST'])
def handle_delete_project():
    name = request.json['data']
    status, code = delete_project(name)
    return {'data':str(status)}, code

@app.route('/get_project_config', methods=['POST'])
def handle_get_project_config():
    name = request.json['data']
    data = get_project_config(name)
    return {'data':data}

@app.route('/set_project_config', methods=['POST'])
def handle_set_project_config():
    data = request.json['data']
    name = data['name']
    output_based = data['input']['type'] == 'Function of the output'
    with open(f'./project_files/{name}/config.json', 'w') as f:
        json.dump(data, f)
    if output_based and not os.path.exists(f'./project_files/{name}/output_function.py'):
        with open(f'./project_files/{name}/output_function.py', 'w') as f:
            f.write(EXAMPLE_OUTPUT_FUNCTION)
    return {'data':'completed'}

@app.route('/train_project', methods=['POST'])
def handle_train_project():
    name = request.json['data']
    training = train_project(name)
    return training

# example config: {"hidden_layers": [{"config": {"activation": "ReLU", "filters": 32}, "size": [3, 3], "type": "Convolution"}, {"size": [2, 2], "type": "Max pooling"}, {"size": [2000, 2000], "type": "Dense"}], "input": {"type": "Black and White Image"}, "name": "test", "output": {"type": "Identification"}, "training_data_path": "A:\\documents\\easy-ai\\backend\\helpers\\mnist_dataset\\labels.json"}
@app.route('/predict', methods=['POST'])
def handle_predict():
    try:
        req_data = request.json['data']
        project_name = req_data['project']
        config = get_project_config(project_name)
        data_path = req_data['path']
        model_path = os.path.join(os.path.dirname(config['training_data_path']), config['name'] + '.keras')

        output = predict(data_path, model_path, config)
        return {'data':str(output)}, 200
    except:
        tb = traceback.format_exc()
        print(tb)
        return {'error':tb}, 500

if __name__ == '__main__':
    app.run()