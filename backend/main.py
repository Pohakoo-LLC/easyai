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
    
@app.route('/has_associated_model', methods=['POST'])
def handle_has_associated_model():
    name = request.json['data']
    return {'data':has_associated_model(name)}

if __name__ == '__main__':
    app.run()