from flask import Flask, jsonify, request, session, redirect
from formsio_app.app import db
import uuid, os

class Form:

	def get_form():
		data = db.forms.find({"team_id" : session['user']['team']['_id']})
		final = []
		for value in data:
			final.append(value)
		return final

	def submit_form():
		if db.forms.find_one({'title': request.form.get('title'),'team_id': session['user']['team']['_id']}):
			return jsonify({'error' : 'This title is already in your list of forms!'}), 400
		else:
			session['form_title'] = request.form.get('title')
			form = {
				'title' : session['form_title']
			}

			if 'current_form_id' in session.keys():
				if db.forms.update({'_id' : session['current_form_id']}, {'$set' : form}):
					return jsonify({'success' : 'The title has been changed successfully!'}), 200
				else:
					return jsonify({'error' : 'Could not update the form title!'}), 400
			else:
				session['current_form_id'] = uuid.uuid4().hex
				form['_id'] = session['current_form_id']
				form['team_id'] = session['user']['team']['_id']
			
				if db.forms.insert(form):
					return jsonify({'success' : 'The form has been created successfully!'}), 200
				else:
					return jsonify({'error' : 'Could not create the form!'}), 400

