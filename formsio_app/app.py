from flask import Flask, render_template, session, redirect
from dotenv import load_dotenv
from functools import wraps
import pymongo
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = "ceva"

# Database

db = pymongo.MongoClient("mongodb+srv://cristiandarla:" + os.getenv("DB_PASS") + "@cluster0.brovt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")['formsio']

# Decorators
def login_required(f):
  @wraps(f)
  def wrap(*args, **kwargs):
    if 'logged_in' in session:
      return f(*args, **kwargs)
    else:
      return redirect('/')
  
  return wrap
  
def no_login_required(f):
  @wraps(f)
  def wrap(*args, **kwargs):
    if 'logged_in' not in session:
      return f(*args, **kwargs)
    else:
      return redirect('/')
  
  return wrap

# Routes
from user import routes as user_routes
from team import routes as team_routes

@app.route('/')
def home():
  return render_template('home.html')

@app.route('/profile')
@login_required
def profile():
  return render_template('profile.html')