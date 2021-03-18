from flask import Flask, render_template, session
from formsio_app.app import app, login_required, no_login_required
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
  questions = Form.get_all_question()
  return render_template('form_create.html', questions=questions), 200
@app.route('/forms/submit', methods=['GET'])
@login_required
def congrats_page():
  return render_template('form_create_congrats.html')


@app.route('/forms/create/add', methods=['POST'])
@login_required
def add_question():
  return Form.add_question()
@app.route('/forms/create/update', methods=['POST'])
@login_required
def update_question():
  return Form.update_question()
@app.route('/forms/create/delete', methods=['POST'])
@login_required
def delete_question():
  return Form.delete_question()
@app.route('/forms/submit', methods=['POST'])
@login_required
def submit_form():
  return Form.submit_form()