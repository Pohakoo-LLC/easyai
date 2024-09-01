:: Activate the virtual environment
call .venv\Scripts\activate

:: Install dependencies
python -m pip install -r requirements.txt

:: Run the Python server
python backend/main.py
