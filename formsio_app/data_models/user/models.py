from flask import Flask, jsonify, request, session, redirect
from passlib.hash import pbkdf2_sha256
from formsio_app.app import db
import uuid, datetime
from random import choice, shuffle

icons = ['profile1.jpg', 'profile2.jpg', 'profile3.jpg','profile4.jpg', 'profile5.jpg', 'profile6.jpg']

class User:
             
  def start_session(self, user):
    del user['password']
    session['logged_in'] = True
    session['user'] = user
    return jsonify(user), 200

  def signup(self):
    # Create the user object
    user = {
      "_id": uuid.uuid4().hex,
      "name": request.form.get('name'),
      "email": request.form.get('email'),
      "password": request.form.get('password'),
      "user_icon": "/assets/profile/" + choice(icons),
      "created_time" : datetime.datetime.utcnow(),
      "last_modified_at" : datetime.datetime.utcnow()
    }
    empty = [index for index, value in user.items() if not value]
    if empty:
      return jsonify({ "error": f'Some requested data are not there: {", ".join(empty)}' }), 400
    # Encrypt the password
    user['password'] = pbkdf2_sha256.encrypt(user['password'])
    user['deleted_at'] = None

    # Check for existing email address
    if db.users.find_one({ "email": user['email'] }):
      return jsonify({ "error": "Email address already in use" }), 400

    if db.users.insert_one(user):
      return self.start_session(user)
    
    return jsonify({ "error": "Signup failed" }), 400
  
  def signout(self):
    session.clear()
    return redirect('/')
  
  def login(self):

    user = db.users.find_one({
      "email": request.form.get('email')
    })

    if user and pbkdf2_sha256.verify(request.form.get('password'), user['password']):
      return self.start_session(user)
    
    return jsonify({ "error": "Invalid login credentials" }), 401

  def change_phone(self):
    phone = request.form.get("phone")
    if "user" in session:
      if db.users.update_many({"_id" : session['user']['_id']}, {"$set" : {"phone" : phone }}):
        user = db.users.find_one({ "_id": session['user']['_id'] })
        session['user'] = user

        return jsonify(user), 200
      else:
        return jsonify({"error" : "Could not update the user." }), 400
    else:
      return jsonify({"error" : "Could not find the user." }), 400

  def change_address(self):
    address = request.form.get("address")
    if "user" in session:
      if db.users.update_many({"_id" : session['user']['_id']}, {"$set" : {"address" : address }}):
        user = db.users.find_one({ "_id": session['user']['_id'] })
        session['user'] = user

        return jsonify(user), 200
      else:
        return jsonify({"error" : "Could not update the user." }), 400
    else:
      return jsonify({"error" : "Could not find the user." }), 400
