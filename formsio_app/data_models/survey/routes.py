from flask import Flask, render_template, session
from formsio_app.app import app, login_required, no_login_required
from .models import Survey

@app.route('/survey', methods=['GET'])
@login_required
def survey():
  return render_template('survey_take.html'), 200
@app.route('/survey/<guid>', methods=['GET'])
@login_required
def get_survey_questions(guid):
  questions = Survey.get_all_questions(guid)
  return render_template('survey_load.html', questions=questions), 200