from flask import Flask, jsonify, request, send_from_directory
from search_movies import search_movies_in_qdrant
import json

# app = Flask(__name__, static_folder='client/build', static_url_path='')

# @app.route("/")
# def index():
#     return send_from_directory(app.static_folder, 'index.html')

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/search_movies')
def get_movie_list():
    user_query = request.args.get('user_query')

    # if not user_query:
    #     return jsonify({'error': 'Please provide the search query.'}), 404
    
    response = search_movies_in_qdrant(user_query)

    if response is not None:
        return jsonify(response)
    else:
        return jsonify({'error': 'Unable to fetch movie data.'}), 500