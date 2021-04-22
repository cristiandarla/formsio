from flask import Flask, render_template, session, jsonify, request, url_for
from werkzeug.utils import redirect
from formsio_app.app import app, login_required, no_login_required
from .models import Survey

@app.route('/survey')
@login_required
def survey():
  return render_template('survey_take.html'), 200
@app.route('/survey/congrats', methods=['GET'])
@login_required
def survey_congrats():
  return render_template('survey_congrats.html'), 200
@app.route('/survey/<guid>', methods=['GET', 'POST'])
@login_required
def get_survey_questions(guid):
  if request.method == 'GET':
    return redirect(url_for('survey'))
  else:
    questions = Survey.get_all_questions(guid)
    return jsonify({'questions' : questions}), 200
@app.route('/survey', methods=['POST'])
@login_required
def post_survey_question():
  return Survey.save_question()