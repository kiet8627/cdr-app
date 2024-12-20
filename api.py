import os
import io
from flask import Flask, request, jsonify
from base64 import b64decode, encodebytes

import numpy as np
from PIL import Image

import skimage
from skimage.segmentation import slic
from skimage.util import img_as_float

from keras.models import load_model
from keras.utils import img_to_array


# ML
model = load_model('densenet_best.hdf5')
leafTypes = ['bg', 'healthy', 'gls', 'nlb', 'nls']


def encode_img(img):
    byte_arr = io.BytesIO()
    img.save(byte_arr, format='PNG')
    encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')
    return encoded_img


def recognize(img):

    res = []

    img = Image.fromarray(img).resize((256, 256))
    segments = slic(img_as_float(img), n_segments=20, sigma=5)

    for (i, segVal) in enumerate(np.unique(segments)):
        mask = np.zeros(img.size[:2], dtype="uint8")
        mask[segments == segVal] = 255
        extracted_mask = np.stack(np.nonzero(mask), axis=-1)
        im = Image.fromarray(mask)
        cropped_segment = im.crop((min(extracted_mask[:, 1]), min(
            extracted_mask[:, 0]), max(extracted_mask[:, 1]), max(extracted_mask[:, 0])))
        cropped_img_segment = img.crop((min(extracted_mask[:, 1]), min(
            extracted_mask[:, 0]), max(extracted_mask[:, 1]), max(extracted_mask[:, 0])))
        temp = np.array(cropped_segment)/255
        output = np.array(cropped_img_segment)

        for i in range(3):
            final_result = np.multiply(
                temp, (np.array(cropped_img_segment)[:, :, i]))
            output[:, :, i] = final_result
        final_seg = Image.fromarray(output)

        seg = img_to_array(final_seg)
        seg = np.expand_dims(seg, axis=0)
        seg = seg.astype('float') / 255.0

        out = model.predict(seg)
        leafType = leafTypes[np.argmax(out)]

        res.append((encode_img(final_seg), leafType))

    print(len(res))
    return res


# API
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.form['file']
        with open(os.path.join(app.config['UPLOAD_FOLDER'], 'tmp.png'), "wb") as fh:
            fh.write(b64decode(f))

        res = os.path.join(app.config['UPLOAD_FOLDER'], 'tmp.png')

        img = skimage.io.imread('uploads/tmp.png')
        res = recognize(img)

        return {'res': res}
    elif request.method == 'GET':
        return "<h1 style='color:blue'>CDR</h1>"


app.run(host='0.0.0.0')
