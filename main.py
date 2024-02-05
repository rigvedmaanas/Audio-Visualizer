import os
import uuid
import time
from flask import request, Flask, render_template, make_response, jsonify, send_from_directory, abort, redirect, url_for
from werkzeug.utils import secure_filename
from pathlib import Path
import arrow
import threading


def remover():
    critical_time = arrow.now().shift(hours=+24)

    for item in Path(app.config["UPLOAD_FOLDER"]).glob('*'):

        if item.is_file():

            item_time = arrow.get(item.stat().st_mtime)
            if item_time < critical_time:
                os.remove(str(item.absolute()))
            print(str(item.absolute()))
    time.sleep(60*30)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB
app.config['UPLOAD_FOLDER'] = 'Uploads'
t1 = threading.Thread(target=remover)
t1.start()

@app.errorhandler(413)
def too_large(e):
    return make_response(jsonify(message="File is too large"), 413)

@app.route('/')
def home():
    return render_template('index.html')



ALLOWED_EXTENSIONS = {"mp3", "ogg", "wav"}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    display = request.form.get("display")
    if file.filename == '':
        return 'No selected file', 400

    elif 'file' not in request.files:
        return 'No file part in the request', 400
    elif allowed_file(file.filename) == False:

        return 'Incorrect File format'
    elif 'file' in request.files:
        file = request.files['file']

        filename = secure_filename(file.filename)
        new_filename =f"{uuid.uuid4()}.{filename.rsplit('.', 1)[1].lower()}"
        try:
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], new_filename))
        except Exception as e:
            return f'Error saving file: {str(e)}', 500
        return redirect(f"/audio/{new_filename}?display={display}")

    return 'No file uploaded'

@app.route('/audio/<path:path>')
def audio(path):
    display = request.args.get('display', "Song")
    url = url_for('get', path=path)
    print(request.url_root+url)
    return render_template("audio.html", path=request.url_root+url, display=display)

@app.route('/get/<path:path>',methods = ['GET','POST'])
def get(path):
    try:
        return send_from_directory(app.config["UPLOAD_FOLDER"], path, as_attachment=True)
    except FileNotFoundError:
        abort(404)
if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0")