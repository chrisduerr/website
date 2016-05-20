from flask import Flask, render_template, send_from_directory, request

import os
import redis
import logging

app = Flask(__name__, static_folder='static', static_url_path='')

REDIS_URL = os.environ.get('REDIS_URL')
db = redis.Redis.from_url(REDIS_URL, decode_responses=True)

@app.route("/")
def index():
    intro_content = db.get('intro-content')
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
