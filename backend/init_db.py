# init_db.py
from server import app, db, bcrypt, User

with app.app_context():
    # 删除现有表（可选，仅初次运行）
    db.drop_all()
    db.create_all()

    # 生成并添加用户
    hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
    users = [
        User(username='admin', password=hashed_password, role='admin', profile_name='企业达人'),
        User(username='user1', password=hashed_password, role='user', profile_name='营销新星'),
        User(username='user2', password=hashed_password, role='user', profile_name='销售精英')
    ]
    for user in users:
        db.session.add(user)
    db.session.commit()

    print("数据库初始化完成！用户列表：")
    for user in User.query.all():
        print(f"用户名: {user.username}, 角色: {user.role}, 昵称: {user.profile_name}")