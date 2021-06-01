from flask import render_template, session, jsonify
from flask.globals import request
from formsio_app.app import app, login_required, db
from .models import Form

@app.route('/forms', methods=['GET'])
@login_required
def forms_base():
  return render_template('form_base.html'), 200

@app.route('/forms/all', methods=['GET'])
@login_required
def get_forms():
  return render_template('form_list.html'), 200
@app.route('/forms/all', methods=['POST'])
@login_required
def get_all_forms():
  forms = Form.get_form()
  return jsonify({'forms' : forms}), 200
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
@app.route('/forms/desc', methods=['GET'])
@login_required
def get_desc():
  return Form.get_desc()

@app.route('/forms/<guid>', methods=['GET'])
@login_required
def individiual_form(guid):
  session['current_form_id'] = guid
  questions = []
  for value in db.questions.find({'form_id':guid, 'isDeleted' : {'$ne' : True}}):
    del value['isDeleted']
    questions.append(value)
  questions = sorted(questions, key = (lambda x: x['position']))
  form  = db.forms.find_one({'_id' : guid})
  if form is not None:
    session['form_title'] = form['title']
  return render_template('form_individual.html', questions = questions), 200
@app.route('/forms/<guid>/results', methods=['POST', 'GET'])
@login_required
def result_form(guid):
  if request.method == 'GET':
    return render_template('survey_results.html')
  else:
    surveys = Form.get_results()
    questions = []
    for value in db.questions.find({'form_id':guid, 'isDeleted' : {'$ne' : True}}):
      del value['isDeleted']
      questions.append(value)
    questions = sorted(questions, key = (lambda x: x['position']))
    return jsonify({'data' : {'surveys' : surveys, 'questions' : questions}}), 200


@app.route('/forms/submit', methods=['POST'])
@login_required
def submit_form():
  return Form.submit_form()
@app.route('/forms/subject', methods=['POST'])
@login_required
def change_title():
  return Form.change_title()
@app.route('/forms/desc', methods=['POST'])
@login_required
def change_desc():
  return Form.change_desc()
@app.route('/form/finish', methods=['POST'])
@login_required
def finish():
  return Form.finish_form()