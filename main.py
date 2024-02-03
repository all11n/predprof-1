from flask import Flask, render_template, request, render_template, jsonify, redirect, session, Response
from flask_login import LoginManager, login_required
from flask_login import logout_user, login_user, current_user
from models import *
from db import db_init
from UserLogin import UserLogin
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from functools import wraps
import json
from config import *

app = Flask(__name__)
login_manager = LoginManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
app.config["SECRET_KEY"] = "qlzhboqngoqk"

db_init(app)

def is_admin():
    if User.query.get(current_user.get_id()).is_admin:
        return True
    return False

def admin_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if is_admin(): 
            return f(*args, *kwargs)
        return redirect("/")
    return decorated_function

@login_manager.user_loader
def load_user(user_id : int):
    return UserLogin().fromDB(user_id, User)

@app.route("/", methods=["GET"]) # main page
def main_page():
    print(current_user.__dict__)
    return render_template("index.html")

@app.route("/logup", methods=["POST"]) # create new account
def logup():
    data = request.get_json()
    password = data.get("password")
    login = data.get("login")
    is_admin = data.get("is_admin")
    code = data.get("code")
    if len(User.query.filter_by(login=login).all()) != 0:
        return jsonify({"message" : "Этот логин уже использован"}), 401
    if is_admin and code != CODE:
        return jsonify({"message" : "Неверный код админа"}), 401
    if len(password) >= 8:
        user = User(login=login, password=generate_password_hash(data.get("password")), is_admin=is_admin)
        db.session.add(user)
        db.session.commit()
        return jsonify({"message" : "Регистрация успешна"}), 200
    else:
        return jsonify({"message" : "Пароль должен быть длиной от 8 символов"}), 401

@app.route("/auth", methods=["POST"]) # authenticate
def auth():
    data = request.get_json()
    login = data.get("login")
    password = data.get("password")
    try:
        user = User.query.filter_by(login=login).first()
        if check_password_hash(user.password, password):
            user_login = UserLogin().create(user)
            login_user(user_login)
            return jsonify({"message" : "Вход успешен"}), 200
        return jsonify({"message" : "Неверный логин или пароль"}), 401
    except:
        return jsonify({"message" : "Неверный логин или пароль"}), 401

@app.route("/field_select", methods=["GET"])
@login_required
def select_field():
    return render_template("select_field.html")

@app.route("/game/<int:field_id>", methods=["GET"]) # game page
@login_required
def game_page(field_id):
    field = Field.query.get(field_id)
    user_id = current_user.get_id()
    if field is None or user_id not in json.loads(field.users) and not is_admin():
        return redirect("/")
    cells = Cell.query.filter_by(field_id=field_id)
    rows = []
    size = field.size

    for i in range(size):
        row = []
        for j in range(size):
            row.append(cells[size*i+j].__dict__)
        rows.append(row)
    return render_template("game.html", rows=rows, cells=cells)

@app.route("/game", methods=["POST"]) # post request handler for /game
@login_required
def game_post():
    data = request.get_json() # get data from request
    cell_id = data.get("cell_id") # get cell_id
    cell = Cell.query.get(cell_id)
    user_id = current_user.get_id()
    field = Field.query.get(cell.field_id)
    users_data = json.loads(field.users)
    if is_admin(): 
        return jsonify({"message" : "Админ не может участвовать в игре!"}), 406
    if users_data.get(user_id) == 0:
        return jsonify({"message" : "У вас нет выстрелов!"}), 406
    if cell.shot_by != 0:
        return jsonify({"message" : "Эта клетка уже прострелена"}), 406
    users_data[user_id] -= 1
    cell.shot_by = current_user.get_id()
    field.users = json.dumps(users_data)
    db.session.commit()
    status = cell.ship_id != 0
    return jsonify({"cell_id" : cell_id, "status" : status}), 200

@app.route("/create_field", methods=["GET"]) # create field page
@login_required
@admin_only
def create_field_page():
    # data = request.get_json()
    # size = data.get("size")
    # size = 7
    # field = Field(size=size, users=json.dumps({1 : 2}))
    # db.session.add(field)
    # db.session.commit()
    # for y in range(size):
    #     for x in range(size):
    #         cell = Cell(x=x, y=y, field_id=field.id, shot_by=0, ship_id=0)
    #         db.session.add(cell)
    # db.session.commit()
    return render_template("game_add.html")

@app.route("/create_field", methods=["POST"]) # post request handler for /create_field
@login_required
@admin_only
def create_field():
    # data = request.get_json()
    # size = data.get("size")
    pass

@app.route("/get_img/<int:img_id>")
def get_img(img_id : int):
    try:
        img = Image.query.get(img_id)
    except:
        return None
    return Response(img.img, mimetype=img.mimetype)

@app.route("/prizes", methods=["GET"])
@login_required
def prizes():
    return render_template("prizes.html")

@app.errorhandler(401)
def auth_error(error):
    return redirect("/")

@app.errorhandler(500)
def server_error(error):
    return redirect("/")

app.run("0.0.0.0", debug=True)
