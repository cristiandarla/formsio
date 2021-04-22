from flask import Flask, render_template, session,\
                  redirect, request, url_for, flash
from dotenv import load_dotenv
from functools import wraps
import pymongo
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")

# Database

db = pymongo.MongoClient(os.getenv("MONGODB_URI"))['formsio']

# Utilities

def redirect_url(default='profile'):
    return request.args.get('next') or \
           request.referrer or \
           url_for(default)

# Decorators
def login_required(f):
  @wraps(f)
  def wrap(*args, **kwargs):
    if 'logged_in' in session:
      return f(*args, **kwargs)
    else:
      flash("That page cannot be accessed now! you should be logged in!")
      return redirect('/')
  
  return wrap
  
def no_login_required(f):
  @wraps(f)
  def wrap(*args, **kwargs):
    if 'logged_in' not in session:
      return f(*args, **kwargs)
    else:
      flash("That page cannot be accessed while logged in!")
      return redirect(redirect_url())
  
  return wrap

# Routes
from .data_models.user import routes as user_routes
from .data_models.team import routes as team_routes
from .data_models.form import routes as form_routes
from .data_models.question import routes as question_routes
from .data_models.survey import routes as survey_routes

@app.route('/')
def home():
  return render_template('home.html')

@app.route('/service-worker.js')
def service_worker():
  return app.send_static_file('service-worker.js')

@app.errorhandler(403)
def page_not_found(e):
    return render_template('error.html', code = 403, error = 'FORBIDDEN'), 403
@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html', code = 404, error = 'PAGE NOT FOUND'), 404
@app.errorhandler(500)
def page_not_found(e):
    return render_template('error.html', code = 500, error = 'SERVER ERROR'), 500