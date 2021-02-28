from flask import Flask, render_template
from formsio_app.app import app

@app.route('/team')
def team():
  return render_template('team.html'), 200
@app.route('/team/add', methods=['GET'])
def team_add_get():
  return render_template('team_add.html'), 200
@app.route('/team/join', methods=['GET'])
def team_join_get():
  return render_template('team_select.html'), 200

@app.route('/team/add', methods=['POST'])
def team_add():
  return render_template('team_add.html'), 200
@app.route('/team/join', methods=['POST'])
def team_join():
  return render_template('team_select.html'), 200