from flask import Flask, render_template, session, url_for
from formsio_app.app import app, login_required, no_login_required, db
from .models import Form

@app.route('/forms', methods=['GET'])
@login_required
def forms_base():
  return render_template('form_base.html'), 200

@app.route('/forms/all', methods=['GET'])
@login_required
def get_forms():
  forms = Form.get_form()
  return render_template('form_list.html', forms=forms), 200
@app.route('/forms/create', methods=['GET'])
@login_required
def create_form():
  if 'current_form_id' in session:
    del session['current_form_id']
  if 'form_title' in session:
    del session['form_title']
  return render_template('form_create.html'), 200
@app.route('/forms/submit', methods=['GET'])
@login_required
def congrats_page():
  return render_template('form_create_congrats.html')

@app.route('/forms/<guid>', methods=['GET'])
@login_required
def individiual_form(guid):
  session['current_form_id'] = guid
  questions = []
  for value in db.questions.find({'form_id':guid, 'isDeleted' : {'$ne' : True}}):
    del value['isDeleted']
    questions.append(value)
  form  = db.forms.find_one({'_id' : guid})
  if form is not None:
    session['form_title'] = form['title']
  return render_template('form_individual.html', questions = questions), 200

@app.route('/forms/submit', methods=['POST'])
@login_required
def submit_form():
  return Form.submit_form()