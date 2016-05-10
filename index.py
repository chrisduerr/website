from flask import Flask, render_template, send_from_directory, request
from os import path

import pymongo

app = Flask(__name__, static_folder='static', static_url_path='')

def get_content():
    mongouser = ""
    mongopwd = ""
    file_location = path.join(path.dirname(path.realpath(__file__)), 'mongodb.pwds')
    with open(file_location) as f:
        for line in f:
                mongouser = line.split()[0]
                mongopwd = line.split()[1]
                break

    client = pymongo.MongoClient('undeadleech.com', 27017, serverSelectionTimeoutMS=5000)
    authenticated = client.admin.authenticate(mongouser, mongopwd)
    if authenticated == False:
        raise PermissionError('Could not authenticate at database.')

    db = client.uldotcom.content
    return db

@app.route("/")
def index():
    content = get_content()
    intro_cursor = content.find({"intro": {"$exists": "true"}})
    intro_content = intro_cursor.next()['intro']
    return render_template("index.html", intro_content=intro_content)

@app.route("/sitemap.xml")
@app.route("/robots.txt")
def robots():
    return send_from_directory(app.static_folder, request.path[1:])

@app.route("/impressum")
def impressum():
    return render_template("impressum.html")

if __name__ == "__main__":
    app.debug = True
    app.run()
