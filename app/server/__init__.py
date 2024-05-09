from flask import Flask, jsonify, request, redirect, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import authsignal.client
import datetime
import jwt
import logging
import os

app = Flask(__name__, static_folder='../client/build', static_url_path='')
CORS(app, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/filmate"
db = SQLAlchemy(app)
migrate = Migrate(app, db)

api_key = os.getenv('AUTHSIGNAL_API_KEY')
authsignal_client = authsignal.Client(api_key=api_key)

from server.functions import get_default_list, search_movies_in_qdrant, search_similar_in_qdrant, get_recommendations, get_movie_news, get_movie_casts
from server.models import Favorites

@app.route("/")
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def page_not_found(error):
    print(error)
    return redirect('/')

@app.route('/favorites', methods=['POST', 'GET'])
def handle_favorites():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()

            current_datetime = datetime.datetime.now()

            new_favorite = Favorites(film_id=data['film_id'], username=data['username'], date_added=current_datetime)
            db.session.add(new_favorite)
            db.session.commit()
            return {"message": f"favorite {new_favorite.film_id} has been created successfully."}
        else:
            return {"error": "The request payload is not in JSON format"}

    elif request.method == 'GET':
        favorites = Favorites.query.all()
        results = [
            {
                "film_id": favorite.film_id,
                "user": favorite.username,
                "date_added": favorite.date_added
            } for favorite in favorites]

        return {"count": len(results), "favorites": results}
    
@app.route('/favorites/<favorite_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_favorite(favorite_id):
    favorite = Favorites.query.get_or_404(favorite_id)

    if request.method == 'GET':
        response = {
            "film_id": favorite.film_id,
            "username": favorite.username,
            "date_added": favorite.date_added
        }
        return {"message": "success", "favorite": response}

    elif request.method == 'PUT':
        data = request.get_json()
        favorite.film_id = data['film_id']
        favorite.username = data['username']
        favorite.date_added = data['date_added']
        db.session.add(favorite)
        db.session.commit()
        return {"message": f"Favorite {favorite.film_id} successfully updated"}

    elif request.method == 'DELETE':
        db.session.delete(favorite)
        db.session.commit()
        return {"message": f"Favorite {favorite.film_id} successfully deleted."}

@app.route('/signup', methods=['POST'])
def signup():
    username = request.json.get('username')
    if not username:
        return jsonify({'error': 'Missing username parameter'}), 400

    response = authsignal_client.track(
        user_id=username,
        action="signUp",
        payload={
            "user_id": username,
            "redirectUrl": "http://localhost:5000/callback" # Change the address for dev/prod
        }
    )
    return jsonify(response), 200

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    if not username:
        return jsonify({'error': 'Missing username parameter'}), 400

    response = authsignal_client.track(
        user_id=username,
        action="signIn",
        payload={
            "user_id": username,
            "redirectUrl": "http://localhost:5000/callback" # Change the address for dev/prod
        }
    )
    return jsonify(response), 200

@app.route('/callback', methods=['GET'])
def callback():
    token = request.args.get('token')
    challenge_response = authsignal_client.validate_challenge(token)

    print(challenge_response)

    if challenge_response["state"] == 'CHALLENGE_SUCCEEDED':
        encoded_token = jwt.encode(
            payload={"username": challenge_response["user_id"]},
            key=api_key,
            algorithm="HS256"
        )
        response = redirect('/')
        response.set_cookie(
            key='auth-session',
            value=encoded_token,
            secure=False,
            path='/'
        )
        return response

    return redirect("/")

@app.route("/user", methods=['GET'])
def user():
    token = request.cookies.get('auth-session')
    decoded_token = jwt.decode(token, api_key, algorithms=["HS256"])
    username = decoded_token.get('username')
    response = authsignal_client.get_user(user_id=username)
    return jsonify({"username": username, "email": response["email"]}), 200

@app.route('/init_search', methods=['GET'])
def get_init_movies():
    try:  
        response = get_default_list()

        if response is not None:
            return jsonify(response), 200
        else:
            return jsonify({'error': 'Unable to fetch default movie data.'}), 500
    except Exception as e:
        logging.error(f'Error processing initial search request: {e}')
        return jsonify({'error': str(e)}), 400

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

@app.route('/generate_recommends')
def get_recommends():
    try:
        user_query = request.args.get('user_query')

        response = get_recommendations(user_query)

        if response is not None:
            return jsonify(response)
        else:
            return jsonify({'error': 'Unable to parse user query.'}), 500
    except Exception as e:
        logging.error(f'Error generating news from the query: {e}')
        return jsonify({'error': str(e)}), 400

@app.route('/generate_news')
def get_news():
    try:
        movie_title = request.args.get('title')

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