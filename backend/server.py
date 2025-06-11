from flask import Flask, jsonify, request, render_template,send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os


app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)


# 配置数据库
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


# 用户模型
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    profile_name = db.Column(db.String(80), nullable=False)  # 添加 profile_name 字段



# 静态文件路由
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/api/users', methods=['GET'])
@login_required
def get_all_users():
    if current_user.role != 'admin':
        return jsonify({"message": "权限不足"}), 403

    users = User.query.all()
    user_list = [
        {
            "id": user.id,
            "username": user.username,
            "profile_name": user.profile_name,
            "role": user.role
        }
        for user in users
    ]
    return jsonify(user_list), 200

@app.route('/api/profile-name', methods=['GET'])
def get_profile_name():
    username = request.args.get('username')  # 从查询参数获取 username

    if not username:
        return jsonify({"message": "缺少用户名参数"}), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"message": "用户不存在"}), 404

    return jsonify({"name": user.profile_name}), 200

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response

    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "无请求数据"}), 400

        username = data.get('username')
        password = data.get('password')
        profile_name = data.get('profile_name', username)  # 默认使用 username 作为 profile_name

        if not username or not password:
            return jsonify({"message": "用户名和密码不能为空"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"message": "用户名已存在"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(
            username=username,
            password=hashed_password,
            profile_name=profile_name
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "注册成功"}), 201

    except Exception as e:
        return jsonify({"message": f"服务器错误: {str(e)}"}), 500

@app.route('/api/login', methods=['GET', 'POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response
    if request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({"message": "无请求数据"}), 400
            username = data.get('username')
            password = data.get('password')
            if not username or not password:
                return jsonify({"message": "用户名和密码不能为空"}), 400
            user = User.query.filter_by(username=username).first()
            if user and bcrypt.check_password_hash(user.password, password):
                login_user(user)
                return jsonify({"message": "登录成功", "role": user.role, "profile_name": user.profile_name, "id": user.id, "username": user.username})
            return jsonify({"message": "用户名或密码错误"}), 401
        except Exception as e:
            return jsonify({"message": f"服务器错误: {str(e)}"}), 500
    return render_template('login.html')  # GET 请求渲染登录页面

@app.route('/api/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "登出成功"})

with app.app_context():
    db.create_all()  # 确保数据库表存在

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)