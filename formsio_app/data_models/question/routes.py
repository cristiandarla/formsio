from flask import Flask, render_template, session, jsonify
from formsio_app.app import app, login_required, no_login_required
from .models import Question

@app.route('/forms/create/question/add', methods=['GET'])
@login_required
def add_questions():
  return render_template('form_create.html'), 200


@app.route('/forms/create/question/add', methods=['POST'])
@login_required
def add_question():
  return Question.add_question()
@app.route('/forms/create/question/update', methods=['POST'])
@login_required
def update_question():
  return Question.update_question()
@app.route('/forms/create/question/delete', methods=['POST'])
@login_required
def delete_question():
  return Question.delete_question()
@app.route('/question/get', methods=['POST'])
@login_required
def get_question():
  return Question.get_question()
@app.route('/question/fav', methods=['POST'])
@login_required
def fav_question():
  return Question.fav_question()
@app.route('/questions/fav/get', methods=['POST'])
@login_required
def get_fav_question():
  return Question.get_fav_question()
@app.route('/forms/create/question/get', methods=['POST'])
@login_required
def get_questions():
  questions = Question.get_all_questions()
  return jsonify({'questions' : questions}), 200