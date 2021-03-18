from flask import Flask, jsonify, request, session, redirect
from formsio_app.app import db
import uuid

class Team:

  def get_teams():
    data = db.teams.find()
    final = []
    for value in data:
      final.append(value)
    return final

  def add_team():
    team = {
      "_id" : uuid.uuid4().hex,
      "name": request.form.get('team'),
      "members" : [session['user']['_id']]
    }

    if "user" in session:
      if db.teams.insert_one(team):
        if db.users.update_many({"_id" : session['user']['_id']}, {"$set" : {"team" : team }}):
          if 'team' in session['user'].keys():
            if db.teams.update_many({"_id" : session['user']['team']['_id']}, {"$pull" : {"members" : session['user']['_id']}}):

              user = db.users.find_one({ "_id": session['user']['_id'] })
              session['user'] = user

              return jsonify(user), 200
            else:
              db.users.update_many({"_id" : session['user']['_id']}, {"$set" : {"team" : session['user']['team']}})
              return jsonify({"error" : "Could not update the team." }), 400
          else:
            user = db.users.find_one({ "_id": session['user']['_id'] })
            session['user'] = user

            return jsonify(user), 200
        else:
          return jsonify({"error" : "Could not update the user." }), 400
      else:
        return jsonify({"error" : "Could not insert the team to database." }), 400
    else:
      return jsonify({"error" : "Could not find the user." }), 400

  def set_team():
    team_id = request.form.get('team')
    team = db.teams.find_one({ "_id": team_id })
    if db.users.update_many({"_id" : session['user']['_id']}, {"$set" : {"team" : team }}):
      if 'team' in session['user'].keys():
        if db.teams.update_many({"_id" : team_id}, {"$push" : {"members" : session['user']['_id']}}):
          if db.teams.update_many({"_id" : session['user']['team']['_id']}, {"$pull" : {"members" : session['user']['_id']}}):

            user = db.users.find_one({ "_id": session['user']['_id'] })
            session['user'] = user

            return jsonify(user), 200
          else:
            db.users.update_many({"_id" : session['user']['_id']}, {"$set" : {"team" : session['user']['team']}})
            return jsonify({"error" : "Could not update the team." }), 400
        else:
          db.users.update_many({"_id" : session['user']['_id']}, {"$set" : {"team" : session['user']['team'] }})
          return jsonify({"error" : "Could not add user in the team." }), 400
      else:
        user = db.users.find_one({ "_id": session['user']['_id'] })
        session['user'] = user

        return jsonify(user), 200
    else:
      return jsonify({"error" : "Could not update the user." }), 400

