from flask import Flask, render_template
from app import app
from user.models import User

@app.route('/signup', methods=['POST'])
def signup():
  return User().signup()
@app.route('/login', methods=['POST'])
def login():
  return User().login()

@app.route('/signup', methods=['GET'])
def signup_get():
  return render_template('signup.html')
@app.route('/login', methods=['GET'])
def login_get():
  return render_template('login.html')

@app.route('/signout')
def signout():
  return User().signout()