from app import app, db, User
import uuid

with app.app_context():
    # DESTROY ALL OLD DATA
    db.drop_all()
    # REBUILD CLEAN TABLES
    db.create_all() 
    
    test_email = "test@admin.com"
    test_password = "DeepFakeAdmin2026!"
    
    # Generate a secure API Key and create the user
    api_key = uuid.uuid4().hex
    new_user = User(
        email=test_email, 
        password=test_password, 
        company="DeepFakeDetect Admin", 
        api_key=api_key
    )
    db.session.add(new_user)
    db.session.commit()
    print(f"✅ Success! Old database wiped. New account created.")
    print(f"📧 Email: {test_email}")
    print(f"🔑 Password: {test_password}")