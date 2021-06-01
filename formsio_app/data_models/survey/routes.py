from flask import render_template, jsonify, request
from formsio_app.app import app, login_required
from .models import Survey

@app.route('/survey/congrats', methods=['GET'])
@login_required
def survey_congrats():
  return render_template('survey_congrats.html'), 200

@app.route('/survey/<guid>', methods=['GET', 'POST'])
@login_required
def get_survey_questions(guid):
  questions = Survey.get_all_questions(guid)
  if request.method == 'GET':
    return render_template('survey_take.html'), 200
  else:
    return jsonify({'questions' : questions}), 200
@app.route('/survey', methods=['POST'])
@login_required
def survey():
  if request.method == 'POST':
    return Survey.save_question()