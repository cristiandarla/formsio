from flask import Flask, render_template
from formsio_app.app import app, login_required, no_login_required
from .models import User

# POST
@app.route('/signup', methods=['POST'])
def signup():
  return User().signup()
@app.route('/login', methods=['POST'])
def login():
  return User().login()
@app.route('/profile/phone', methods=['POST'])
@login_required
def phone():
  return User().change_phone()
@app.route('/profile/address', methods=['POST'])
@login_required
def address():
  return User().change_address()

#GET
@app.route('/signup', methods=['GET'])
@no_login_required
def signup_get():
  return render_template('signup.html'), 200
@app.route('/login', methods=['GET'])
@no_login_required
def login_get():
  return render_template('login.html', style='custom'), 200

#ANY
@app.route('/signout')
@login_required
def signout():
  return User().signout()
@app.route('/profile')
@login_required
def profile():
  return render_template('profile.html')