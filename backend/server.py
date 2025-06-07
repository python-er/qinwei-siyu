from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={
    r"/login": {"origins": "http://localhost:3000", "supports_credentials": True},
    r"/api/*": {"origins": "http://localhost:3000", "supports_credentials": True}
})

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

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/api/profile-name', methods=['GET'])
@login_required
def get_profile_name():
    if current_user.is_authenticated:
        return jsonify({"name": current_user.profile_name})
    return jsonify({"message": "未登录"}), 401

@app.route('/login', methods=['GET', 'POST', 'OPTIONS'])
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
                return jsonify({"message": "登录成功", "role": user.role})
            return jsonify({"message": "用户名或密码错误"}), 401
        except Exception as e:
            return jsonify({"message": f"服务器错误: {str(e)}"}), 500
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "登出成功"})

with app.app_context():
    db.create_all()  # 确保数据库表存在

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)