This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# About
Want to create your own AI (neural network)? This project is intended for people with large datasets and a basic understanding of AI, but don't know how to code and don't want to hire a programmer. This makes training a neural network easy, repeatable, and standard.
<br>Coded by [Kai Sereni](https://kai.gallery) in 2024.

# Setup
## Requirements:
- Python 3.10.11
- NPM

## Dataset
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
1. Clone the repo and cd into the folder in Powershell
2. Create a venv with `python -m venv .venv` and `.venv/Scripts/activate`
3. Install the required Python packages with `pip install -r requirements.txt`
4. Run the backend with `python backend/main.py`
5. Open a new Powershell window and cd into the repo folder
6. Install npm packages with `npm i`
7. Run the project with `npm run build` and `npm run start`
8. Open `http://localhost:3000` in your browser

# Additional Notes
- You can download the MNIST dataset and generate an example `labels.json` file by running the script in backend/helpers (102MB)
- There are some test MNIST numbers that I drew in the images path
<br>
![Image 1](images/test_image_4.png) ![Image 2](images/test_image_8.png) ![Image 3](images/test_image_3.png)