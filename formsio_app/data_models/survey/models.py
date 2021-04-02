from flask import Flask, jsonify, request, session, redirect
from formsio_app.app import db
import uuid, os

class Survey:

    def get_all_questions(id):
        data = db.questions.find({'form_id': id, 'isDeleted' : {'$ne' : True}})
        final = []
        for value in data:
            del value['isDeleted']
            final.append(value)
        return final