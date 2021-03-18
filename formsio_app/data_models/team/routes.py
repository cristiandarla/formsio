from flask import Flask, render_template
from formsio_app.app import app
from .models import Team

@app.route('/team')
def team():
  return render_template('team.html'), 200
@app.route('/team/add', methods=['GET'])
def team_add_get():
  return render_template('team_add.html'), 200
@app.route('/team/join', methods=['GET'])
def team_join_get():
  teams = Team.get_teams()
  return render_template('team_select.html', teams = teams), 200

@app.route('/team/add', methods=['POST'])
def team_add():
  return Team.add_team()
@app.route('/team/join', methods=['POST'])
def team_join():
  return Team.set_team()