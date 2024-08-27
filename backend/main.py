from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

def get_projects() -> list[str]:
    files = os.listdir('./project_files')
    return files

@app.route('/get_projects', methods=['GET'])
def handle_get_projects():
    projects = get_projects()
    return {'data':projects}

if __name__ == '__main__':
    app.run()