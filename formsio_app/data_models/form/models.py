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

	def get_all_question():
		if 'current_form_id' in session.keys():
			data = db.questions.find({'form_id': session['current_form_id'], 'isDeleted' : {'$ne' : True}})
			final = []
			for value in data:
				final.append(value)
			return final
		else:
			return []

	def add_question():
		if 'current_form_id' in session.keys():
			form_id = session['current_form_id']
		else:
			form_id = uuid.uuid4().hex
			session['current_form_id'] = form_id
		
		question = {
			"_id" : uuid.uuid4().hex,
			"text" : request.form.get('text'),
			"question_type" : request.form.get('type'),
			"form_id" : form_id,
			"isDeleted" : False
		}
		if not request.form.getlist('answers[]'):
			pass
		else:
			question['answers'] = request.form.getlist('answers[]')
		
		if db.questions.insert_one(question):
			return jsonify(question), 200
		else:
			return jsonify({'error': 'Could not add the question! Try again!'}), 400

	def update_question():
		current_id = {'_id' : request.form.get('_id')}
		current_question = db.questions.find_one(current_id)
		if current_question:
			updates = {}
			final = {}
			remove_old = {}
			if current_question['text'] != request.form.get('text'):
				updates['text'] = request.form.get('text')
			if current_question['question_type'] != request.form.get('type'):
				updates['question_type'] = request.form.get('type')

			current_has_answers = current_question['question_type'] in ['checkbox', 'radio']
			new_has_answers = request.form.get('type') in ['checkbox', 'radio']

			if current_has_answers:
				remove_old['$unset'] = {'answers' : {}}

			if new_has_answers:
				final['$addToSet'] = {'answers' : {'$each' : request.form.getlist('answers[]')}}

			if updates:
				final['$set'] = updates


			# make the calls to db
			if current_has_answers:
				if db.questions.update_many(current_id, remove_old):
					if db.questions.update_many(current_id, final):
						return jsonify({}), 200
					else:
						return jsonify({'error' : 'Could not update the question!'})
				else:
					return jsonify({'error' : 'Could not update the answers array!'})
			else:
				if db.questions.update_many(current_id, final):
					return jsonify({}), 200
				else:
					return jsonify({'error' : 'Could not update the question!'})

		else:
			return jsonify({'error' : 'Could not find this question!'}), 400

	def delete_question():
		if db.questions.update({'_id' : request.form.get('id')}, {'$set' : {'isDeleted' : True}}):
			return jsonify({}), 200
		else:
			return jsonify({'error' : 'Could not delete the question!'}), 400

	def fav_question():
		if db.questions.update({'_id' : request.form.get('id')}, {'$set' : {'fav' : True}}):
			return jsonify({}), 200
		else:
			return jsonify({'error' : 'Could not delete the question!'}), 400

	def submit_form():
		session['form_title'] = request.form.get('title')
		form = {
			'_id' : session['current_form_id'],
			'team_id' : session['user']['team']['_id'],
			'title' : request.form.get('title')
		}
		if db.forms.insert(form):
			return jsonify({}), 200
		else:
			return jsonify({'error' : 'Could not create the form!'}), 400

