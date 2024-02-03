from db import db
from flask_sqlalchemy import *


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return f"<User {self.id}>"


class Field(db.Model):
    __tablename__ = "field"
    id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.Integer, nullable=False)
    ships = db.relationship("Ship", backref="field", lazy=True, uselist=True)
    cells = db.relationship("Cell", backref="field", lazy=True, uselist=True)
    users = db.Column(db.JSON, nullable=True)

    def __repr__(self):
        return f"<Field {self.id}>"


class Cell(db.Model):
    __tablename__ = "cell"
    id = db.Column(db.Integer, primary_key=True)
    x = db.Column(db.Integer, nullable=False)
    y = db.Column(db.Integer, nullable=False)
    ship_id = db.Column(db.Integer, db.ForeignKey("ship.id"), nullable=True)
    field_id = db.Column(db.Integer, db.ForeignKey("field.id"), nullable=False)
    shot_by = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f"<Cell {self.id}>"


class Ship(db.Model):
    __tablename__ = "ship"
    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey("field.id"), nullable=False)
    cells = db.relationship("Cell", backref="ship", lazy=True, uselist=True)
    prize_id = db.Column(db.Integer, db.ForeignKey("prize.id"), nullable=False)

    def __repr__(self):
        return f"<Ship {self.id}>"


class Prize(db.Model):
    __tablename__ = "prize"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    image_id = db.Column(db.Integer, db.ForeignKey("image.id"), nullable=False)
    ship = db.relationship("Ship", backref="prize", lazy=True, uselist=False)
    got_by = db.Column(db.Integer, nullable=True)
    desc = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f"<Prize {self.id}>"


class Image(db.Model):
    __tablename__ = "image"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    mimetype = db.Column(db.String, nullable=False)
    image = db.Column(db.String, nullable=False)
    prize_id = db.relationship("Prize", backref="image", lazy=True, uselist=False)

    def __repr__(self):
        return f"<Image {self.id}>"
