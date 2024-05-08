from server import db

class Favorites(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    film_id = db.Column(db.Integer())
    username = db.Column(db.String())
    date_added = db.Column(db.DateTime())

    def __init__(self, film_id, username, date_added):
        self.film_id = film_id
        self.username = username
        self.date_added = date_added

    def __repr__(self):
        return f"<Film {self.film_id}>"