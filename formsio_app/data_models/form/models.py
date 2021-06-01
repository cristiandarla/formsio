from flask import Flask, jsonify, request, session, redirect
from formsio_app.app import db
import uuid, os

class Form:

	def finish_form():
		ids = request.form.getlist('ids[]')
		for index, element in enumerate(ids):
			if index < len(ids) - 1:
				if db.questions.update({'_id' : element}, {'$set' : {'trailing_question' : ids[index + 1], 'position' : index}}):
					pass
				else:
					return jsonify({'error' : 'There was an error on updating the questions!'}), 400
			else:
				if db.questions.update({'_id' : element}, {'$set' : {'trailing_question' : None, 'position' : index}}):
					pass
				else:
					return jsonify({'error' : 'There was an error on updating the questions!'}), 400
		return jsonify({'success': 'Everything went well on updating the questions!'}), 200
		
	def change_title():
		if db.forms.update({'_id' : session['current_form_id']}, {'$set' : {'title' : request.form.get('title')}}):
			return jsonify({'success' : 'The title has been changed successfully!'}), 200
		else:
			return jsonify({'error' : 'Could not update the form title!'}), 400
	def change_desc():
		if db.forms.update({'_id' : session['current_form_id']}, {'$set' : {'desc' : request.form.get('desc')}}):
			return jsonify({'success' : 'The description has been changed successfully!'}), 200
		else:
			return jsonify({'error' : 'Could not update the form description!'}), 400
	def get_desc():
		current = db.forms.find_one({'_id': session['current_form_id']})
		if current:
			return jsonify({'desc' : current['form_description']}), 200
		else:
			return jsonify({'error' : 'Could not find the current form!'}), 400
		

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
				'title' : session['form_title'],
				'form_description' : request.form.get('desc')
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
	
	def get_results():
		data = db.surveys.find({'form_id' : session['current_form_id']})
		final = []
		if data:
			for value in data:
				final.append(value)
		return final
