# DeepFake Detection Platform

An enterprise-grade deepfake detection platform that helps organizations identify manipulated media with high accuracy.

## Features

- Real-time deepfake detection for images and videos
- Advanced facial analysis
- Enterprise-grade security
- API access for integration
- User management and analytics
- Contact form for sales inquiries

## Tech Stack

- Backend: Python/Flask
- Frontend: HTML, CSS, JavaScript
- Database: SQLite (can be scaled to PostgreSQL)
- ML Framework: OpenCV, DeepFace
- Authentication: API Key based

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/deepfake-detection.git
cd deepfake-detection
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the root directory with:
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

5. Initialize the database:
```bash
flask db init
flask db migrate
flask db upgrade
```

6. Run the application:
```bash
flask run
```

The application will be available at `http://localhost:5000`

## API Usage

### Authentication

All API requests require an API key to be included in the header:
```
X-API-Key: your-api-key-here
```

### Endpoints

1. Register a new user:
```bash
POST /api/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "secure-password",
    "company": "Company Name"
}
```

2. Detect deepfake:
```bash
POST /api/detect
Content-Type: multipart/form-data

file: <image/video file>
```

3. Submit contact form:
```bash
POST /api/contact
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Company Name",
    "message": "Inquiry message"
}
```

## Development

### File Structure

```
deepfake-detection/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .env               # Environment variables
├── uploads/           # Uploaded files directory
├── static/
│   ├── styles.css     # CSS styles
│   └── script.js      # Frontend JavaScript
└── templates/
    └── index.html     # Main HTML template
```

### Database Models

1. User
- id: Primary key
- email: Unique email address
- password: Hashed password
- company: Company name
- api_key: Unique API key
- created_at: Timestamp

2. Analysis
- id: Primary key
- user_id: Foreign key to User
- file_path: Path to analyzed file
- result: Detection score
- confidence: Confidence score
- created_at: Timestamp
- media_type: Image/Video

3. Contact
- id: Primary key
- name: Contact name
- email: Contact email
- company: Company name
- message: Inquiry message
- created_at: Timestamp

## Security Considerations

1. API Keys
- Store securely
- Rotate regularly
- Rate limit requests

2. File Upload
- Validate file types
- Limit file size
- Scan for malware

3. User Data
- Hash passwords
- Encrypt sensitive data
- Regular backups

## Production Deployment

1. Update configuration:
- Use PostgreSQL database
- Configure proper secret key
- Set up proper file storage (e.g., S3)
- Enable HTTPS
- Set up proper logging

2. Deploy using Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

3. Set up Nginx as reverse proxy

4. Configure monitoring and alerts

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited. 