from flask import Flask, jsonify, request, session, redirect
from formsio_app.app import db
import uuid, os

class Question:

	def get_all_questions():
		if 'current_form_id' in session.keys():
			data = db.questions.find({'form_id': session['current_form_id'], 'isDeleted' : False})
			final = []
			for value in data:
				del value['isDeleted']
				final.append(value)
			final = sorted(final, key = (lambda x: x['position']))
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
			"isDeleted" : False,
			"isFavourite" : False,
			"trailing_question" : None,
			"position" : int(request.form.get('position'))
		}
		if not request.form.getlist('answers[]'):
			question['answers'] = []
		else:
			answers = []
			for index, entry in enumerate(request.form.getlist('answers[]'), start=1):
				answer = {}
				answer['text'] = entry
				answer['ordinal_pos'] = index
				answer['trailing_question'] = None
				answers.append(answer)
			question['answers'] = answers
		
		if db.questions.insert_one(question):
			return jsonify({'success' : 'The question has been sent succesfully!', 'data': question}), 200
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
				answers = []
				for index, entry in enumerate(request.form.getlist('answers[]'), start=1):
					answer = {}
					answer['text'] = entry
					answer['ordinal_pos'] = index
					answer['trailing_question'] = None
					answers.append(answer)
				final['$addToSet'] = {'answers' : {'$each' : answers}}

			if updates:
				final['$set'] = updates


			# make the calls to db
			if current_has_answers:
				if db.questions.update_many(current_id, remove_old):
					if db.questions.update_many(current_id, final):
						return jsonify({'success' : 'The question has been updated succesfully!',\
						'data' : db.questions.find_one(current_id)}), 200
					else:
						return jsonify({'error' : 'Could not update the question!'}), 400
				else:
					return jsonify({'error' : 'Could not update the answers array!'}), 400
			else:
				if db.questions.update_many(current_id, final):
					return jsonify({'success' : 'The question has been updated succesfully!',\
						'data' : db.questions.find_one(current_id)}), 200
				else:
					return jsonify({'error' : 'Could not update the question!'}), 400

		else:
			return jsonify({'error' : 'Could not find this question!'}), 400

	def delete_question():
		if db.questions.update({'_id' : request.form.get('id')}, {'$set' : {'isDeleted' : True}}):
			return jsonify({}), 200
		else:
			return jsonify({'error' : 'Could not delete the question!'}), 400

	def fav_question():
		quest = db.questions.find_one({'_id' : request.form.get('id')})
		if db.questions.update({'_id' : request.form.get('id')}, {'$set' : {'isFavourite' : not quest['isFavourite']}}):
			return jsonify(db.questions.find_one(request.form.get('id'))), 200
		else:
			return jsonify({'error' : 'Could not delete the question!'}), 400
	
	def get_fav_question():
		if 'user' in session.keys():
			if 'team' in session['user'].keys():
				if '_id' in session['user']['team'].keys():
					if 'current_form_id' in session.keys():
						copies = []
						for entry in db.questions.find({'form_id' : session['current_form_id'], 'isCopy' : True, 'isDeleted' : False}):
							copies.append(entry['original_id'])
						forms_ids = []
						for value in db.forms.find({'team_id' : session['user']['team']['_id']}):
							if value['_id'] != session['current_form_id']:
								forms_ids.append(value['_id'])
						if copies:
							data = db.questions.find({'form_id': {'$in' : forms_ids}, 'isFavourite' : True,\
								'isCopy' : {'$exists' : False}, '_id' : {'$nin' : copies}})
						else:
							data = db.questions.find({'form_id': {'$in' : forms_ids}, 'isFavourite' : True,\
								'isCopy' : {'$exists' : False}})
						final = []
						for value in data:
							final.append(value)
						final = sorted(final, key = (lambda x: x['position']))
						return jsonify({'data' : final}), 200
					else:
						return jsonify({'error' : "Cannot find the form! Select one first!"}), 400
				else:
					return jsonify({'error' : "Cannot find the team id! How did you get here?"}), 400
			else:
				return jsonify({'error' : "Cannot find the team id! Select a team first."}), 400
		else:
			return jsonify({'error' : "Cannot find the current user! What's your name? Please, log in and be polite!"}), 400

	def get_question():
		quest = db.questions.find_one({'_id' : request.form.get('id')})
		if quest:
			return jsonify(quest), 200
		else:
			return jsonify({'error' : 'Could not find current qeustion!'}), 400
	
	def add_fav_question():
		if 'current_form_id' in session.keys():
			id = request.form.get('id')
			form = db.questions.find_one({'_id' : id})
			form['original_id'] = form['_id'] 
			form['isCopy'] = True
			form['position'] = int(request.form.get('position'))
			form['form_id'] = session['current_form_id']
			form['_id'] = uuid.uuid4().hex
			if db.questions.insert_one(form):
				return jsonify({'success' : 'The question has been added successfully!', 'data' : form}), 200
			else:
				return jsonify({'error' : 'Cannot insert this as favourite!'}), 400
		else:
			return jsonify({'error' : 'Cannot find the form! Select one first!'}), 400