import os
import requests
import gzip
import shutil
import numpy as np
from PIL import Image
import json
from helpers.neural_nets import root

# URLs for the MNIST dataset
urls = {
    "train_images": "http://yann.lecun.com/exdb/mnist/train-images-idx3-ubyte.gz",
    "train_labels": "http://yann.lecun.com/exdb/mnist/train-labels-idx1-ubyte.gz",
    "test_images": "http://yann.lecun.com/exdb/mnist/t10k-images-idx3-ubyte.gz",
    "test_labels": "http://yann.lecun.com/exdb/mnist/t10k-labels-idx1-ubyte.gz"
}

# Directory to save the dataset
dataset_dir = root("mnist_dataset")
images_dir = os.path.join(dataset_dir, "images")
os.makedirs(images_dir, exist_ok=True)

def download_and_extract(url, filename):
    response = requests.get(url, stream=True)
    with open(filename, 'wb') as f:
        f.write(response.content)
    with gzip.open(filename, 'rb') as f_in:
        with open(filename.replace('.gz', ''), 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    os.remove(filename)
    print(f"Downloaded and extracted {url}")

def load_images(filename):
    with open(filename, 'rb') as f:
        f.read(16)  # skip the header
        data = np.frombuffer(f.read(), dtype=np.uint8)
    return data.reshape(-1, 28, 28)

def load_labels(filename):
    with open(filename, 'rb') as f:
        f.read(8)  # skip the header
        data = np.frombuffer(f.read(), dtype=np.uint8)
    return data

def save_images(images, labels, images_dir):
    mapping = {}
    for i, (image, label) in enumerate(zip(images, labels)):
        image_path = os.path.join(images_dir, f"{i}.png")
        relative_image_path = os.path.relpath(image_path, dataset_dir)
        Image.fromarray(image).save(image_path)
        mapping[relative_image_path] = int(label)
    return mapping

# Download and extract the dataset
for key, url in urls.items():
    filename = os.path.join(dataset_dir, url.split('/')[-1])
    try:
        download_and_extract(url, filename)
    except:
        print(f"Failed to download {url}, switching to mirror")
        download_and_extract(f"https://web.archive.org/web/20220331130319/{url}", filename)

print("Finished downloading and extracting the dataset, labeling images...")

# Load images and labels
train_images = load_images(os.path.join(dataset_dir, "train-images-idx3-ubyte"))
train_labels = load_labels(os.path.join(dataset_dir, "train-labels-idx1-ubyte"))
test_images = load_images(os.path.join(dataset_dir, "t10k-images-idx3-ubyte"))
test_labels = load_labels(os.path.join(dataset_dir, "t10k-labels-idx1-ubyte"))

# Save images and create JSON mapping
mapping = {}
mapping.update(save_images(train_images, train_labels, images_dir))
mapping.update(save_images(test_images, test_labels, images_dir))

# Save the mapping to a JSON file
with open(os.path.join(dataset_dir, "labels.json"), 'w') as f:
    json.dump(mapping, f)

print(f"\n> Path to labels.json: {os.path.abspath(os.path.join(dataset_dir, 'labels.json'))}")