# About
Want to create your own AI (neural network)? This project is intended for people with large datasets and a basic understanding of AI, but don't know how to code and don't want to hire a programmer. This makes training a neural network easy, repeatable, and standard. You can train a neural network with any input type and any output type, allowing you to create identification models, GPTs, image generators, audio cleanup models, and more.

### Credit
Coded by [Kai Sereni](https://kai.gallery) in 2024. Property of [Pohakoo, LLC](https://pohakoo.com). open MIT license.

# Setup
## Requirements:
- Python 3.10.11 (does not have to be in PATH)
- NPM

## Create Your Own Dataset
Here's an example of what a dataset folder should look like. This example dataset has a list of images, each with a hand-drawn number, with the neural network's goal being to identify the number given the image.
```tree
Dataset
├── labels.json
├── images
│   ├── image0.png
│   ├── image1.png
│   ├── image2.png
│   ├── ...
```
Example `labels.json`:
```json
{"images/image0.png":"4", "images/image1.png":"1", "images/image2.png":"8", ...} 
// The path to the image is relative to the labels.json file.
// The labels are always either a string with a label or a string with a relative file path.
```

## Quick Start (Windows)
### Method 1 (build executable)
1. Clone the repo and cd into the folder in Powershell
2. Run `./build_exe` (will take 5 - 20 minutes)
3. If the build was unsuccessful, it will tell you the problem. Fix and repeat step 2.
4. Run the executable at out/EasyAI-win32-x64/EasyAI.exe
### Method 2 (run code)
1. Clone the repo and cd into the folder in Powershell
2. Create a venv with `python -m venv .venv` and `.venv/Scripts/activate`
3. Install the required Python packages with `pip install -r requirements.txt`
4. Run the backend with `python backend/main.py`
5. Open a new Powershell window and cd into the repo folder
6. Install npm packages with `npm i`
7. Run the project with `npm run build` and `npm run start`
8. Open `http://localhost:3000` in your browser

### Why not just provide a downloadable executable?
You should pretty much never just download an executable from the internet and run it, even if you trust the source. This script allows you to see all the source code and then build the exe yourself easily, at the cost of having to download Python and NPM, which may be a hassle for non-programmers. This is why open-source code is so amazing, there's no trust required.

# Additional Notes
- You can download the MNIST dataset and generate an example `labels.json` file by running the script in backend/helpers (102MB)
- There are some test MNIST numbers that I drew in the images path
<br>
![Image 1](images/test_image_4.png) ![Image 2](images/test_image_8.png) ![Image 3](images/test_image_3.png)