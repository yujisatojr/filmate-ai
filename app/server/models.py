from server import db

class Users(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String())
    username = db.Column(db.String())
    email = db.Column(db.String())
    first_name = db.Column(db.String())
    last_name = db.Column(db.String())
    picture_url = db.Column(db.String())
    date_added = db.Column(db.DateTime())

    def __init__(self, user_id, username, email, first_name, last_name, picture_url, date_added):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.picture_url = picture_url
        self.date_added = date_added

    def __repr__(self):
        return f"<User {self.user_id}>"
    
class Followers(db.Model):
    __tablename__ = 'followers'
    
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.String()) # following user
    followee_id = db.Column(db.String()) # user being followed by other user
    date_added = db.Column(db.DateTime())

    def __init__(self, follower_id, followee_id, date_added):
        self.follower_id = follower_id
        self.followee_id = followee_id
        self.date_added = date_added

    def __repr__(self):
        return f"<Follower {self.follower_id}>"
    
class Reviews(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    film_id = db.Column(db.Integer())
    user_id = db.Column(db.String())
    rating = db.Column(db.Integer())
    comment = db.Column(db.String())
    date_added = db.Column(db.DateTime())

    def __init__(self, film_id, user_id, rating, comment, date_added):
        self.film_id = film_id
        self.user_id = user_id
        self.rating = rating
        self.comment = comment
        self.date_added = date_added

    def __repr__(self):
        return f"<Review {self.id}>"

class Favorites(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    film_id = db.Column(db.Integer())
    user_id = db.Column(db.String())
    date_added = db.Column(db.DateTime())

    def __init__(self, film_id, user_id, date_added):
        self.film_id = film_id
        self.user_id = user_id
        self.date_added = date_added

    def __repr__(self):
        return f"<Film {self.film_id}>"
    
class Bookmarks(db.Model):
    __tablename__ = 'bookmarks'

    id = db.Column(db.Integer, primary_key=True)
    film_id = db.Column(db.Integer())
    user_id = db.Column(db.String())
    date_added = db.Column(db.DateTime())

    def __init__(self, film_id, user_id, date_added):
        self.film_id = film_id
        self.user_id = user_id
        self.date_added = date_added

    def __repr__(self):
        return f"<Film {self.film_id}>"