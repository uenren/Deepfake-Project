# Deepfake-Project
DeepFakeDetect: AI-Powered Media Authentication
DeepFakeDetect is a full-stack web application designed to identify and analyze manipulated media. By leveraging the DeepFace framework and TensorFlow, the platform provides real-time detection of deepfakes, offering users a probability score of manipulation alongside detailed facial attribute analysis.

🚀 Features
Real-time Image Analysis: Instant detection of facial manipulation using state-of-the-art AI models.

DeepFace Integration: Extracts subject metadata including estimated age, primary emotion, gender, and dominant race.

Secure Authentication: User registration and login system with unique API keys for secure endpoint access.

Intuitive Dashboard: A modern, dark-themed UI built with a focus on user experience and data visualization.

Scalable Backend: Powered by Flask and SQLite for lightweight yet efficient data management.

🛠️ Technical Stack
Frontend
HTML5 & CSS3: Custom responsive layout with modern glassmorphism effects.

JavaScript (ES6+): Asynchronous API handling and dynamic DOM manipulation.

FontAwesome: For intuitive iconography.

Backend
Flask: Python-based micro-framework for the web server and REST API.

SQLAlchemy: ORM for managing the SQLite database.

JWT & UUID: For secure user identification and API key generation.

AI/ML Engine
DeepFace: Core framework for facial attribute analysis and verification.

TensorFlow: Backend engine for running deep learning models.

OpenCV: For image processing and computer vision tasks.

⚙️ Installation & Setup
Clone the Repository

Bash
git clone https://github.com/yourusername/deepfake-detection.git
cd deepfake-detection
Set up Virtual Environment

Bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
Install Dependencies

Bash
pip install -r requirements.txt
Initialize Database & Create Test User

Bash
python create_user.py
Run the Application

Bash
python app.py
The app will be available at http://127.0.0.1:5000.

🧠 How it Works
The application follows a standard Client-Server architecture. When an image is uploaded:

The Frontend validates the file type and sends it to the Flask API via a POST request.

The Backend saves the image temporarily and passes it to the DeepFace analysis pipeline.

The AI Model detects the face, extracts features, and calculates a manipulation probability based on facial inconsistencies.

Results are returned as JSON and rendered into a visual report for the user.

📝 License
Distributed under the MIT License. See LICENSE for more information.
