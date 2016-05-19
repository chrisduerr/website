from flask import Flask, render_template, send_from_directory, request
from os import path

import os
import pymongo
import logging

app = Flask(__name__, static_folder='static', static_url_path='')

MONGO_URL = os.environ.get('MONGO_URL')
db = pymongo.MongoClient(MONGO_URL).uldotcom

@app.route("/")
def index():
    intro_cursor = db.content.find({"intro": {"$exists": "true"}})
    intro_content = intro_cursor.next()['intro']
    return render_template("index.html", intro_content=intro_content)

@app.route("/sitemap.xml")
@app.route("/robots.txt")
def robots():
    return send_from_directory(app.static_folder, request.path[1:])

@app.route("/impressum")
def impressum():
    return render_template("impressum.html")

# Thanks to cookie for fixing my shit
@app.before_first_request
def setup_logging():
    # In production mode, add log handler to sys.stderr.
    app.logger.addHandler(logging.StreamHandler())
    app.logger.setLevel(logging.INFO)

if __name__ == "__main__":
    app.debug = True
    app.run()
