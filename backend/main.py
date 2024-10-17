from flask import Flask, request
from flask_cors import CORS
from helpers.interfacing import *
from helpers.neural_nets import predict

app = Flask(__name__)
app.logger.disabled = False
app.logger.setLevel('INFO')
CORS(app)

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
    set_project_config(data)
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
    app.run(host='127.0.0.1', port=5000)