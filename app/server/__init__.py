from dotenv import load_dotenv, find_dotenv
from flask import Flask, jsonify, request, redirect, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import authsignal.client
import datetime
import jwt
import logging
import os
import requests

load_dotenv(find_dotenv())

app = Flask(__name__, static_folder='../client/build', static_url_path='')
CORS(app, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_DATABASE_URL')
db = SQLAlchemy(app)
migrate = Migrate(app, db)

api_key = os.getenv('AUTHSIGNAL_API_KEY')
authsignal_client = authsignal.Client(api_key=api_key)

from server.functions import get_default_list, search_movies_in_qdrant, search_similar_in_qdrant, get_recommendations, get_movie_facts, get_favorites_in_qdrant, get_bookmarks_in_qdrant
from server.models import Favorites, Bookmarks

@app.route("/")
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def page_not_found(error):
    print(error)
    return redirect('/')

# Favorites model routes
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
                "username": favorite.username,
                "date_added": favorite.date_added
            } for favorite in favorites]

        return {"count": len(results), "favorites": results}
    
@app.route('/favorite', methods=['PUT', 'DELETE'])
def handle_favorite():
    data = request.get_json()
    favorite_id = data['favorite_id']

    favorite = Favorites.query.get_or_404(favorite_id)

    # if request.method == 'GET':
    #     response = {
    #         "film_id": favorite.film_id,
    #         "username": favorite.username,
    #         "date_added": favorite.date_added
    #     }
    #     return {"message": "success", "favorite": response}

    if request.method == 'PUT':
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
    
@app.route("/query_favorite", methods=['POST'])
def favorite_by_film_id_and_username():
    data = request.get_json()
    film_id = data.get('film_id')
    username = data.get('username')
    
    favorite = Favorites.query.filter_by(film_id=film_id, username=username).first()
    
    if favorite is None:
        return jsonify({'message': 'not found'}), 200
    
    response = {
        "favorite_id": favorite.id,
        "film_id": favorite.film_id,
        "username": favorite.username,
    }
    return {"message": "success", "favorite": response}, 200

@app.route("/query_favorites", methods=['POST'])
def favorites_by_username():
    if request.is_json:
        data = request.get_json()
        username = data['username']

        print(username)

        favorites = Favorites.query.filter_by(username=username)
        results = [
            {
                "film_id": favorite.film_id,
                "username": favorite.username,
                "date_added": favorite.date_added
            } for favorite in favorites]

        return {"count": len(results), "favorites": results}
    
# Bookmarks model routes
@app.route('/bookmarks', methods=['POST', 'GET'])
def handle_bookmarks():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()

            current_datetime = datetime.datetime.now()

            new_bookmark = Bookmarks(film_id=data['film_id'], username=data['username'], date_added=current_datetime)
            db.session.add(new_bookmark)
            db.session.commit()
            return {"message": f"bookmark {new_bookmark.film_id} has been created successfully."}
        else:
            return {"error": "The request payload is not in JSON format"}

    elif request.method == 'GET':            
        bookmarks = Bookmarks.query.all()
        results = [
            {
                "film_id": bookmark.film_id,
                "username": bookmark.username,
                "date_added": bookmark.date_added
            } for bookmark in bookmarks]

        return {"count": len(results), "bookmarks": results}
    
@app.route('/bookmark', methods=['PUT', 'DELETE'])
def handle_bookmark():
    data = request.get_json()
    bookmark_id = data['bookmark_id']
    bookmark = Bookmarks.query.get_or_404(bookmark_id)

    if request.method == 'PUT':
        data = request.get_json()
        bookmark.film_id = data['film_id']
        bookmark.username = data['username']
        bookmark.date_added = data['date_added']
        db.session.add(bookmark)
        db.session.commit()
        return {"message": f"Bookmark {bookmark.film_id} successfully updated"}

    elif request.method == 'DELETE':
        db.session.delete(bookmark)
        db.session.commit()
        return {"message": f"Bookmark {bookmark.film_id} successfully deleted."}
    
@app.route("/query_bookmark", methods=['POST'])
def bookmark_by_film_id_and_username():
    data = request.get_json()
    film_id = data.get('film_id')
    username = data.get('username')
    
    bookmark = Bookmarks.query.filter_by(film_id=film_id, username=username).first()
    
    if bookmark is None:
        return jsonify({'message': 'not found'}), 200
    
    response = {
        "bookmark_id": bookmark.id,
        "film_id": bookmark.film_id,
        "username": bookmark.username,
    }
    return {"message": "success", "bookmark": response}, 200

@app.route("/query_bookmarks", methods=['POST'])
def bookmarks_by_username():
    if request.is_json:
        data = request.get_json()
        username = data['username']

        print(username)

        bookmarks = Bookmarks.query.filter_by(username=username)
        results = [
            {
                "film_id": bookmark.film_id,
                "username": bookmark.username,
                "date_added": bookmark.date_added
            } for bookmark in bookmarks]

        return {"count": len(results), "bookmarks": results}

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
            "redirectUrl": os.getenv('HOST_URL') + "/callback" # Change the address for dev/prod
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
            "redirectUrl": os.getenv('HOST_URL') + "/callback" # Change the address for dev/prod
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
    
@app.route('/index_favorites', methods=['POST'])
def index_favortie_movies():
    data = request.get_json()
    id_list = data['id_list']

    try:
        response = get_favorites_in_qdrant(id_list)

        if response is not None:
            return jsonify(response), 200
        else:
            return jsonify({'error': 'Unable to fetch favorite movies data.'}), 500
    except Exception as e:
        logging.error(f'Error processing favorites search request: {e}')
        return jsonify({'error': str(e)}), 400
    
@app.route('/index_bookmarks', methods=['POST'])
def index_bookmark_movies():
    data = request.get_json()
    id_list = data['id_list']

    try:
        response = get_bookmarks_in_qdrant(id_list)

        if response is not None:
            return jsonify(response), 200
        else:
            return jsonify({'error': 'Unable to fetch saved movies data.'}), 500
    except Exception as e:
        logging.error(f'Error processing saved movies search request: {e}')
        return jsonify({'error': str(e)}), 400

@app.route('/generate_recommends')
def get_recommends():
    try:
        keyword = request.args.get('keyword')

        response = get_recommendations(keyword)

        if response is not None:
            return jsonify(response)
        else:
            return jsonify({'error': 'Unable to parse user query.'}), 500
    except Exception as e:
        logging.error(f'Error generating news from the query: {e}')
        return jsonify({'error': str(e)}), 400

@app.route('/generate_facts')
def get_facts():
    try:
        movie_title = request.args.get('title')

        response = get_movie_facts(movie_title)

        if response is not None:
            return jsonify(response)
        else:
            return jsonify({'error': 'Unable to parse user query.'}), 500
    except Exception as e:
        logging.error(f'Error generating facts from the query: {e}')
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

@app.route('/networks')
def get_networks():
    movie_id = request.args.get('movie_id', default=None)
    formatted_movie_id = ''
    if movie_id is not None and len(movie_id) < 7:
        formatted_movie_id = '{:07d}'.format(int(movie_id))
    else:
        formatted_movie_id = movie_id

    watchmode_api_key = os.getenv('WATCHMODE_API_KEY')
    url = f'https://api.watchmode.com/v1/title/tt{formatted_movie_id}/sources/?apiKey={watchmode_api_key}&regions=US'

    response = requests.get(url)
    data = response.json()

    if response.status_code == 200 and data:
        result = []
        for network in data:
            if network['type'] == 'sub' and network['name'] in ['Netflix', 'Prime Video', 'Disney+', 'MAX', 'Hulu', 'Paramount Plus', 'MGM+']:
                result_dict = {
                    'name': network['name'],
                    'price': network['price'],
                    'url': network['web_url']
                }
                result.append(result_dict)

        return jsonify(result)
    else:
        return jsonify([])