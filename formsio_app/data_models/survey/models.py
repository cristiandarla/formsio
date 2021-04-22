from flask import Flask, jsonify, request, session, redirect
from formsio_app.app import db
import uuid, os, json

class Survey:

    def get_all_questions(id):
        data = db.questions.find({'form_id': id, 'isDeleted' : {'$ne' : True}})
        final = []
        for value in data:
            del value['isDeleted']
            final.append(value)
        return final

    def save_question():
        data = request.form.to_dict()
        data['answers'] = json.loads(data['answers'])
        data['_id'] = uuid.uuid4().hex
        if db.surveys.insert_one(data):
            return jsonify({}), 200
        else:
            return jsonify({'error' : 'Could not access the server!'}), 400