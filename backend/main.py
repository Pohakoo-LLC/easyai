import json
import os
import shutil
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_projects() -> list[str]:
    files = os.listdir('./project_files')
    return files

def new_project(project_name: str):
    try:
        os.mkdir(f'./project_files/{project_name}')
        with open(f'./project_files/{project_name}/config.json', 'w') as f:
            json.dump({'name': project_name}, f)
        return "completed", 200
    except OSError or PermissionError as e:
        return f"Error: {e}", 500
    
def delete_project(project_name: str):
    try:
        shutil.rmtree(f'./project_files/{project_name}')
        return "completed", 200
    except OSError or PermissionError as e:
        return f"Error: {e}", 500

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
    with open(f'./project_files/{name}/config.json', 'r') as f:
        data = json.load(f)
    return {'data':data}

if __name__ == '__main__':
    app.run()