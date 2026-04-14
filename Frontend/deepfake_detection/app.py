from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import jwt
from functools import wraps
import uuid
import cv2
import numpy as np
from deepface import DeepFace
from sqlalchemy import or_

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this to a secure secret key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///deepfake.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    company = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    api_key = db.Column(db.String(32), unique=True)

class Analysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    file_path = db.Column(db.String(255))
    result = db.Column(db.Float)
    confidence = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    media_type = db.Column(db.String(10))  # 'image' or 'video'

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120))
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Authentication decorator
def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'message': 'API key is missing'}), 401
        
        user = User.query.filter_by(api_key=api_key).first()
        if not user:
            return jsonify({'message': 'Invalid API key'}), 401
        
        return f(*args, **kwargs)
    return decorated

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login.html')
def login_page():
    return render_template('login.html')

@app.route('/api/detect', methods=['POST'])
@require_api_key
def detect():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Determine file type
        media_type = 'video' if filename.lower().endswith(('.mp4', '.avi', '.mov')) else 'image'
        
        try:
            # Process the file
            if media_type == 'image':
                result = process_image(file_path)
            else:
                result = process_video(file_path)
            
            # Save analysis to database
            analysis = Analysis(
                user_id=User.query.filter_by(api_key=request.headers.get('X-API-Key')).first().id,
                file_path=file_path,
                result=result['manipulation_score'],
                confidence=result['confidence'],
                media_type=media_type
            )
            db.session.add(analysis)
            db.session.commit()
            
            return jsonify(result)
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    return jsonify({'error': 'File processing failed'}), 400

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.json
    
    contact = Contact(
        name=data['name'],
        email=data['email'],
        company=data.get('company'),
        message=data['message']
    )
    
    try:
        db.session.add(contact)
        db.session.commit()
        return jsonify({'message': 'Contact form submitted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    api_key = uuid.uuid4().hex
    user = User(
        email=data['email'],
        password=data['password'],  # In production, hash the password
        company=data.get('company'),
        api_key=api_key
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({
            'message': 'Registration successful',
            'api_key': api_key
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----- NEW LOGIN ROUTE ADDED HERE -----
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    # Verify user exists and password matches
    if user and user.password == data['password']:
        # Create a JWT token for the session
        token = jwt.encode({
            'user_id': user.id
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'email': user.email,
                'company': user.company,
                'api_key': user.api_key
            }
        }), 200
        
    return jsonify({'error': 'Invalid email or password'}), 401
# --------------------------------------

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify({'results': []}), 200

    try:
        # Search in FAQ/Documentation
        faqs = [
            {
                'question': 'What is a deepfake?',
                'answer': 'A deepfake is synthetic media where a person in an existing image or video is replaced with someone else\'s likeness using artificial intelligence.'
            },
            {
                'question': 'How does deepfake detection work?',
                'answer': 'Our deepfake detection uses advanced AI to analyze visual artifacts, inconsistencies, and patterns that are typical of manipulated media.'
            },
            {
                'question': 'What file types are supported?',
                'answer': 'We support common image formats (JPG, PNG, WEBP) and video formats (MP4, AVI, MOV).'
            },
            {
                'question': 'How accurate is the detection?',
                'answer': 'Our system achieves 99.9% accuracy on benchmark datasets, with a very low false positive rate.'
            }
        ]

        # Search in analyses (if user is authenticated)
        api_key = request.headers.get('X-API-Key')
        if api_key:
            user = User.query.filter_by(api_key=api_key).first()
            if user:
                analyses = Analysis.query.filter_by(user_id=user.id).order_by(Analysis.created_at.desc()).limit(5).all()
                recent_analyses = [{
                    'id': a.id,
                    'file_path': os.path.basename(a.file_path),
                    'result': a.result,
                    'confidence': a.confidence,
                    'date': a.created_at.strftime('%Y-%m-%d %H:%M:%S')
                } for a in analyses]
            else:
                recent_analyses = []
        else:
            recent_analyses = []

        # Filter results based on search query
        filtered_faqs = [
            faq for faq in faqs 
            if query in faq['question'].lower() or query in faq['answer'].lower()
        ]

        filtered_analyses = [
            analysis for analysis in recent_analyses
            if query in analysis['file_path'].lower()
        ]

        return jsonify({
            'faqs': filtered_faqs,
            'recent_analyses': filtered_analyses
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_image(file_path):
    # Load and process image
    img = cv2.imread(file_path)
    
    try:
        # Use DeepFace for facial analysis
        analysis = DeepFace.analyze(img, actions=['emotion', 'age', 'gender', 'race'])
        
        # Implement your deepfake detection logic here
        # This is a placeholder that returns random scores
        manipulation_score = np.random.uniform(0, 1)
        confidence = np.random.uniform(0.7, 1.0)
        
        return {
            'manipulation_score': float(manipulation_score),
            'confidence': float(confidence),
            'facial_analysis': analysis[0]
        }
    except Exception as e:
        raise Exception(f"Error processing image: {str(e)}")

def process_video(file_path):
    # Implement video processing logic here
    # This is a placeholder that returns random scores
    manipulation_score = np.random.uniform(0, 1)
    confidence = np.random.uniform(0.7, 1.0)
    
    return {
        'manipulation_score': float(manipulation_score),
        'confidence': float(confidence)
    }

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)