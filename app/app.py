from flask import Flask, jsonify, request, send_from_directory
from search_movies import search_movies_in_qdrant, search_similar_in_qdrant, get_movie_news, get_movie_casts
import logging

# app = Flask(__name__, static_folder='client/build', static_url_path='')

# @app.route("/")
# def index():
#     return send_from_directory(app.static_folder, 'index.html')

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/search_movies', methods=['POST'])
def get_movies():
    try:
        json_body = request.get_json()

        if json_body is None:
            logging.error('No JSON data received.')
            return jsonify({'error': 'No JSON data received.'}), 400
        
        response = search_movies_in_qdrant(json_body)

        if response is not None:
            return jsonify(response), 200
        else:
            return jsonify({'error': 'Unable to fetch movie data.'}), 500
    except Exception as e:
        logging.error(f'Error processing search request: {e}')
        return jsonify({'error': str(e)}), 400
    
@app.route('/similarity_search')
def get_similar_movies():
    try:
        metadata = request.args.get('metadata')
        
        response = search_similar_in_qdrant(metadata)

        if response is not None:
            return jsonify(response), 200
        else:
            return jsonify({'error': 'Unable to fetch movie data.'}), 500
    except Exception as e:
        logging.error(f'Error processing search request: {e}')
        return jsonify({'error': str(e)}), 400
    
@app.route('/generate_news')
def get_news():
    try:
        movie_title = request.args.get('title')
        print(movie_title)

        response = get_movie_news(movie_title)

        if response is not None:
            return jsonify(response)
        else:
            return jsonify({'error': 'Unable to parse user query.'}), 500
    except Exception as e:
        logging.error(f'Error generating news from the query: {e}')
        return jsonify({'error': str(e)}), 400
    
# @app.route('/generate_trailer')
# def get_trailer():
#     try:
#         movie_title = request.args.get('title')

#         response = get_movie_trailer(movie_title)

#         if response is not None:
#             return jsonify(response)
#         else:
#             return jsonify({'error': 'Unable to parse user query.'}), 500
#     except Exception as e:
#         logging.error(f'Error generating filters from the query: {e}')
#         return jsonify({'error': str(e)}), 400
    
@app.route('/generate_casts')
def get_casts():
    try:
        movie_title = request.args.get('title')

        response = get_movie_casts(movie_title)

        if response is not None:
            return jsonify(response)
        else:
            return jsonify({'error': 'Unable to parse user query.'}), 500
    except Exception as e:
        logging.error(f'Error generating filters from the query: {e}')
        return jsonify({'error': str(e)}), 400