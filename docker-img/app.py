from flask import Flask, render_template, send_from_directory, request

import os
import redis
import logging

app = Flask(__name__, static_folder='static', static_url_path='')

REDIS_URL = os.environ.get('REDIS_URL')
db = redis.Redis.from_url(REDIS_URL, decode_responses=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/about")
def about():
    about = []
    try:
        about_string = db.get('about-content')
        about = about_string.split(";;")
    except:
        pass
    return render_template("about.html", about=about)

@app.route("/projects")
def projects():
    return render_template("projects.html")

@app.route("/skills")
def skills():
    skills = []
    try:
        for skills_key in db.scan_iter(match="skill*"):
            skill_string = db.get(skills_key)
            skill_list = skill_string.split(";;")
            skill = { 'name': skill_list[0], 'level': skill_list[1] }
            skills.append(skill)
    except:
        pass
    sorted_skills = sorted(skills, key=lambda k: k['level'], reverse=True)
    return render_template("skills.html", skills=sorted_skills)

@app.route("/contact")
def contact():
    contact = []
    try:
        contact_string = db.get('contact-content')
        contact = contact_string.split(";;")
    except:
        pass
    return render_template("contact.html", contact=contact)

@app.route("/impressum")
def impressum():
    return render_template("impressum.html")

@app.route("/sitemap.xml")
@app.route("/robots.txt")
def robots():
    return send_from_directory(app.static_folder, request.path[1:])

# Thanks to cookie for fixing my shit
@app.before_first_request
def setup_logging():
    # In production mode, add log handler to sys.stderr.
    app.logger.addHandler(logging.StreamHandler())
    app.logger.setLevel(logging.INFO)

if __name__ == "__main__":
    app.debug = True
    app.run()
