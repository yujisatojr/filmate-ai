from dotenv import load_dotenv, find_dotenv
from flask import Flask, jsonify, request, redirect, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import datetime
import logging
import os
import requests

load_dotenv(find_dotenv())

app = Flask(__name__, static_folder='../client/build', static_url_path='')
CORS(app, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_DATABASE_URL')
db = SQLAlchemy(app)
migrate = Migrate(app, db)

from server.functions import get_default_list, search_movies_in_qdrant, search_similar_in_qdrant, get_recommendations, get_movie_facts, get_favorites_in_qdrant, get_bookmarks_in_qdrant
from server.models import Users, Followers, Reviews, Favorites, Bookmarks

@app.route("/")
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def page_not_found(error):
    # print(error)
    return redirect('/')

@app.route("/user", methods=['POST'])
def user():
    data = request.get_json()
    user_id = data.get('userId')
    
    user = Users.query.filter_by(user_id=user_id).first()
    
    if user is None:
        timestamp = data['createdAt']
        formatted_timestamp = datetime.datetime.fromtimestamp(timestamp)

        new_user = Users(user_id=data['userId'], username=data['username'], email=data['email'], first_name=data['firstName'], last_name=data['lastName'], picture_url=data['pictureUrl'], date_added=formatted_timestamp)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'New user was added to the table.'}), 200
    
    response = {
        "user_id": user.user_id,
    }
    
    if (user.username != data['username'] or user.email != data['email'] or user.first_name != data['firstName'] or user.last_name != data['lastName'] or user.picture_url != data['pictureUrl']):
        user.username = data['username']
        user.email = data['email']
        user.first_name = data['firstName']
        user.last_name = data['lastName']
        user.picture_url = data['pictureUrl']
        
        db.session.add(user)
        db.session.commit()
        return {"message": "User information is updated.", "user": response}, 200
    else:
        return {"message": "User already exists.", "user": response}, 200
    
@app.route("/get_user", methods=['POST'])
def get_user():
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return {"message": "No user_id provided."}, 400

    user = Users.query.filter_by(user_id=user_id).first()

    if user:
        user_info = {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "picture_url": user.picture_url
        }
        return {"message": "Successfully retrieved user information.", "user": user_info}, 200
    else:
        return {"user_id": user_id, "error": "User not found"}, 404
    
@app.route("/get_users", methods=['POST'])
def get_users():
    data = request.get_json()
    user_ids = data.get('user_ids')
    
    if not user_ids:
        return {"message": "No user_ids provided."}, 400

    users_info = []
    
    for user_id in user_ids:
        user = Users.query.filter_by(user_id=user_id).first()
        if user:
            user_info = {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "picture_url": user.picture_url
            }
            users_info.append(user_info)
        else:
            users_info.append({"user_id": user_id, "error": "User not found"})

    return {"message": "Successfully retrieved user information.", "users": users_info}, 200

@app.route("/get_users_and_films", methods=['POST'])
def get_users_and_films():
    data = request.get_json()
    user_ids = data.get('user_ids')
    film_ids = data.get('film_ids')
    
    if not user_ids:
        return {"message": "No user_ids provided."}, 400
    if not film_ids:
        return {"message": "No film_ids provided."}, 400

    users_info = []
    
    for user_id in user_ids:
        user = Users.query.filter_by(user_id=user_id).first()
        if user:
            user_info = {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "picture_url": user.picture_url
            }
            users_info.append(user_info)
        else:
            users_info.append({"user_id": user_id, "error": "User not found"})
    
    films_info = get_favorites_in_qdrant(film_ids)

    return {"message": "Successfully retrieved user information.", "users": users_info, "films": jsonify(films_info)}, 200
    
@app.route('/search_users', methods=['GET'])
def search_users():
    keyword = request.args.get('keyword', default=None)

    if keyword == '':
        results = []
        return {"message": "success", "count": len(results), "results": results}, 200

    keyword_pattern = f"%{keyword}%"
    users = Users.query.filter(Users.username.like(keyword_pattern)).all()
    
    if users is None:
        return jsonify({'message': 'not found'}), 200
    
    results = [
        {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "picture_url": user.picture_url
        } for user in users]

    return {"message": "success", "count": len(results), "results": results}, 200
    
@app.route('/follower', methods=['POST', 'DELETE'])
def handle_follower():
    data = request.get_json()
    follower_id = data.get('follower_id') # following user (current user)
    followee_id = data.get('followee_id') # user being followed (shows up on profile page)

    if request.method == 'POST':
        current_datetime = datetime.datetime.now()

        new_follow = Followers(follower_id=follower_id, followee_id=followee_id, date_added=current_datetime)
        db.session.add(new_follow)
        db.session.commit()
        return {"message": f"User {new_follow.follower_id} has successfully followed {new_follow.followee_id}."}
    elif request.method == 'DELETE':
        unfollow = Followers.query.filter_by(follower_id=follower_id, followee_id=followee_id).first()
        db.session.delete(unfollow)
        db.session.commit()
        return {"message": f"User {unfollow.follower_id} has successfully unfollowed {unfollow.followee_id}."}
    else:
        return {"error": "The request payload is not in JSON format"}
    
@app.route('/get_follower')
def get_follower():
    follower_id = request.args.get('follower_id')
    followee_id = request.args.get('followee_id')

    follower = Followers.query.filter_by(follower_id=follower_id, followee_id=followee_id).first()
    if follower is None:
        return jsonify({'message': 'not found'}), 200
    else:
        return {"message": "exists"}, 200
    
@app.route('/get_followers', methods=['POST'])
def handle_followers():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        
        followers = Followers.query.filter_by(followee_id=user_id)
        followees = Followers.query.filter_by(follower_id=user_id)

        results_followers = [
        {
            "user_id": follower.follower_id,
        } for follower in followers]

        results_followees = [
        {
            "user_id": followee.followee_id,
        } for followee in followees]

        return {
            "message": "success", 
            "followers_count": len(results_followers), 
            "followees_count": len(results_followees), 
            "results_followers": results_followers, 
            "results_followees": results_followees
        }, 200
    
@app.route('/review', methods=['POST', 'PUT', 'DELETE'])
def handle_review():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()

            current_datetime = datetime.datetime.now()

            new_review = Reviews(film_id=data['film_id'], user_id=data['user_id'], rating=data['rating'], comment=data['comment'], date_added=current_datetime)
            db.session.add(new_review)
            db.session.commit()
            return {"message": f"review {new_review.film_id} has been created successfully."}
        else:
            return {"error": "The request payload is not in JSON format"}
    
    elif request.method == 'PUT':
        data = request.get_json()
        review = Reviews.query.filter_by(film_id=data['film_id'], user_id=data['user_id']).first()

        review.rating = data['rating']
        review.comment = data['comment']
        db.session.add(review)
        db.session.commit()
        return {"message": f"Review {review.id} successfully updated"}

    elif request.method == 'DELETE':
        data = request.get_json()
        review = Reviews.query.filter_by(film_id=data['film_id'], user_id=data['user_id']).first()

        db.session.delete(review)
        db.session.commit()
        return {"message": f"Review {review.id} successfully deleted."}
        
@app.route('/get_review', methods=['POST'])
def get_review():
    data = request.get_json()
    film_id = data.get('film_id')
    user_id = data.get('user_id')

    review = Reviews.query.filter_by(film_id=film_id, user_id=user_id).first()
    if review is None:
        return jsonify({'message': 'not found'}), 200
    else:
        response = {
            "film_id": review.user_id,
            "user_id": review.user_id,
            "rating": review.rating,
            "comment": review.comment
        }

        return {"message": "exists", "review": response}, 200
    
@app.route('/get_reviews', methods=['POST'])
def get_reviews():
    data = request.get_json()
    if request.is_json:
        mode = data.get('mode')
        if mode == 'all':
            reviews = Reviews.query.order_by(Reviews.date_added).all()

            results = [
                {
                    "film_id": review.film_id,
                    "user_id": review.user_id,
                    "rating": review.rating,
                    "comment": review.comment,
                    "date_added": review.date_added
                } for review in reviews]
            
            user_ids = []
            film_ids = []

            for item in results:
                user_ids.append(item['user_id'])
                film_ids.append(item['film_id'])

            users_info = []
            for user_id in user_ids:
                user = Users.query.filter_by(user_id=user_id).first()
                if user:
                    user_info = {
                        "user_id": user.user_id,
                        "username": user.username,
                        "email": user.email,
                        "picture_url": user.picture_url
                    }
                    users_info.append(user_info)
                else:
                    users_info.append({"user_id": user_id, "error": "User not found"})
            
            films_info = get_favorites_in_qdrant(film_ids)

            combined_list = []

            users_dict = {user['user_id']: user for user in users_info}
            films_dict = {film['id']: film for film in films_info}

            for result in results:
                film_id = result['film_id']
                user_id = result['user_id']

                if film_id in films_dict and user_id in users_dict:
                    combined_object = {
                        "film": films_dict[film_id],
                        "review": result,
                        "user": users_dict[user_id]
                    }
                    combined_list.append(combined_object)
                else:
                    print(f"Film with id {film_id} or user with id {user_id} not found.")

            combined_list.sort(key=lambda x: x['review']['date_added'], reverse=True)
            
            return {"count": len(combined_list), "results": combined_list}, 200
        
        elif mode == 'followers':
            user_ids = data.get('user_ids')
        
            if not user_ids:
                return {"message": "List of following IDs not provided."}, 400
            
            for user_id in user_ids:
                reviews = Reviews.query.filter_by(user_id=user_id).order_by(Reviews.date_added).all()
                results = [
                    {
                        "film_id": review.film_id,
                        "user_id": review.user_id,
                        "rating": review.rating,
                        "comment": review.comment,
                        "date_added": review.date_added
                    } for review in reviews]

                # return {"count": len(results), "reviews": results}

            user_ids = []
            film_ids = []

            for item in results:
                user_ids.append(item['user_id'])
                film_ids.append(item['film_id'])

            users_info = []
            for user_id in user_ids:
                user = Users.query.filter_by(user_id=user_id).first()
                if user:
                    user_info = {
                        "user_id": user.user_id,
                        "username": user.username,
                        "email": user.email,
                        "picture_url": user.picture_url
                    }
                    users_info.append(user_info)
                else:
                    users_info.append({"user_id": user_id, "error": "User not found"})
            
            films_info = get_favorites_in_qdrant(film_ids)

            combined_list = []

            users_dict = {user['user_id']: user for user in users_info}
            films_dict = {film['id']: film for film in films_info}

            for result in results:
                film_id = result['film_id']
                user_id = result['user_id']

                if film_id in films_dict and user_id in users_dict:
                    combined_object = {
                        "film": films_dict[film_id],
                        "review": result,
                        "user": users_dict[user_id]
                    }
                    combined_list.append(combined_object)
                else:
                    print(f"Film with id {film_id} or user with id {user_id} not found.")

            combined_list.sort(key=lambda x: x['review']['date_added'], reverse=True)
            
            return {"count": len(combined_list), "results": combined_list}, 200        
        # elif mode == 'follower':
        #     user_ids = data.get('user_ids')
        
        #     if not user_ids:
        #         return {"message": "List of following IDs not provided."}, 400
            
        #     for user_id in user_ids:
        #         reviews = Reviews.query.filter_by(user_id=user_id)
        #         results = [
        #             {
        #                 "film_id": review.film_id,
        #                 "user_id": review.user_id,
        #                 "rating": review.rating,
        #                 "comment": review.comment,
        #                 "date_added": review.date_added
        #             } for review in reviews]

        #         return {"count": len(results), "reviews": results}
    else:
        return {"error": "The request payload is not in JSON format"}
    
# Favorites model routes
@app.route('/favorites', methods=['POST', 'GET'])
def handle_favorites():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()

            current_datetime = datetime.datetime.now()

            new_favorite = Favorites(film_id=data['film_id'], user_id=data['user_id'], date_added=current_datetime)
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
                "user_id": favorite.user_id,
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
    #         "user_id": favorite.user_id,
    #         "date_added": favorite.date_added
    #     }
    #     return {"message": "success", "favorite": response}

    if request.method == 'PUT':
        data = request.get_json()
        favorite.film_id = data['film_id']
        favorite.user_id = data['user_id']
        favorite.date_added = data['date_added']
        db.session.add(favorite)
        db.session.commit()
        return {"message": f"Favorite {favorite.film_id} successfully updated"}

    elif request.method == 'DELETE':
        db.session.delete(favorite)
        db.session.commit()
        return {"message": f"Favorite {favorite.film_id} successfully deleted."}
    
@app.route("/query_favorite", methods=['POST'])
def favorite_by_film_id_and_user_id():
    data = request.get_json()
    film_id = data.get('film_id')
    user_id = data.get('user_id')
    
    favorite = Favorites.query.filter_by(film_id=film_id, user_id=user_id).first()
    
    if favorite is None:
        return jsonify({'message': 'not found'}), 200
    
    response = {
        "favorite_id": favorite.id,
        "film_id": favorite.film_id,
        "user_id": favorite.user_id,
    }
    return {"message": "success", "favorite": response}, 200

@app.route("/query_favorites", methods=['POST'])
def favorites_by_user_id():
    if request.is_json:
        data = request.get_json()
        user_id = data['user_id']

        favorites = Favorites.query.filter_by(user_id=user_id)
        results = [
            {
                "film_id": favorite.film_id,
                "user_id": favorite.user_id,
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

            new_bookmark = Bookmarks(film_id=data['film_id'], user_id=data['user_id'], date_added=current_datetime)
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
                "user_id": bookmark.user_id,
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
        bookmark.user_id = data['user_id']
        bookmark.date_added = data['date_added']
        db.session.add(bookmark)
        db.session.commit()
        return {"message": f"Bookmark {bookmark.film_id} successfully updated"}

    elif request.method == 'DELETE':
        db.session.delete(bookmark)
        db.session.commit()
        return {"message": f"Bookmark {bookmark.film_id} successfully deleted."}
    
@app.route("/query_bookmark", methods=['POST'])
def bookmark_by_film_id_and_user_id():
    data = request.get_json()
    film_id = data.get('film_id')
    user_id = data.get('user_id')
    
    bookmark = Bookmarks.query.filter_by(film_id=film_id, user_id=user_id).first()
    
    if bookmark is None:
        return jsonify({'message': 'not found'}), 200
    
    response = {
        "bookmark_id": bookmark.id,
        "film_id": bookmark.film_id,
        "user_id": bookmark.user_id,
    }
    return {"message": "success", "bookmark": response}, 200

@app.route("/query_bookmarks", methods=['POST'])
def bookmarks_by_user_id():
    if request.is_json:
        data = request.get_json()
        user_id = data['user_id']

        bookmarks = Bookmarks.query.filter_by(user_id=user_id)
        results = [
            {
                "film_id": bookmark.film_id,
                "user_id": bookmark.user_id,
                "date_added": bookmark.date_added
            } for bookmark in bookmarks]

        return {"count": len(results), "bookmarks": results}

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