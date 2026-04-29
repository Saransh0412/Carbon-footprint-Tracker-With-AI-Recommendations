# 🌍 Carbon Footprint Calculator & Tracker

A full-stack web application that helps individuals and small businesses track and reduce their carbon footprint through AI-powered personalized recommendations.


Video Demo Link : https://drive.google.com/file/d/1--PWK8ZkHQxWNRPtajjvANAEv5Q4jvLw/view?usp=drive_link

AI usage Report:https://drive.google.com/file/d/1NiGM8V1KsQNYzLVbkb9CQPKqjfimO08X/view?usp=drive_link

## ✨ Features

- **User Authentication**: Secure registration and login with Firebase Auth (Email/Password + Google Sign-in)
- **Activity Logging**: Track daily carbon emissions from:
  - 🚗 Transportation (car, bus, train, flights)
  - ⚡ Energy usage (electricity, heating, cooling)
  - 🍽️ Diet (beef meals, vegetarian meals)
  - 🛍️ Consumption (shopping, waste generation)
- **Carbon Calculation**: Automatic emission calculations using standard formulas
- **Visual Dashboard**: Interactive charts showing:
  - Daily, weekly, and monthly totals
  - Emissions trends over time
  - Breakdown by category (pie/bar charts)
  - Comparison with previous periods
- **AI-Powered Recommendations**: Personalized suggestions using Hugging Face API
- **Responsive Design**: Works seamlessly on mobile and desktop

## 🛠️ Tech Stack

### Frontend
- **React** (with Vite)
- **Recharts** for data visualization
- **Firebase SDK** for authentication
- **Axios** for API calls

### Backend
- **Python Flask** REST API
- **Firebase Admin SDK** for auth verification
- **Hugging Face Inference API** for AI recommendations

### Database & Auth
- **Firebase Firestore** for data storage
- **Firebase Authentication** for user management

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- A Firebase project
- A Hugging Face account (free tier)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd carbon-footprint-tracker
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google
4. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in production mode
5. Get your Firebase config:
   - Project Settings → General → Your apps → Web app
   - Copy the config object
6. Generate a service account key:
   - Project Settings → Service accounts
   - Click "Generate new private key"
   - Save as `backend/firebase-credentials.json`

### 3. Hugging Face API Setup

1. Go to [Hugging Face](https://huggingface.co)
2. Create a free account (if needed)
3. Go to Settings → Access Tokens
4. Create a new token with read access
5. Copy the token for later use

### 4. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Hugging Face API token
# HF_API_TOKEN=your_token_here
```

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Firebase config
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... (other Firebase config values)
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # On Windows
python app.py
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 📊 Carbon Emission Formulas

The app uses these simplified formulas (you can refine them through research):

| Activity | Formula (CO₂ in kg) |
|----------|---------------------|
| Car (petrol) | Distance (km) × 0.12 |
| Flight (short-haul) | Distance (km) × 0.255 |
| Electricity | kWh × 0.5 |
| Beef meal | 6.0 kg per meal |
| Vegetarian meal | 1.5 kg per meal |

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token

### Activities
- `POST /api/activities` - Log new activity
- `GET /api/activities` - Get user's activities
- `PUT /api/activities/<id>` - Update activity
- `DELETE /api/activities/<id>` - Delete activity

### Calculations
- `POST /api/calculate` - Calculate emissions
- `GET /api/stats` - Get daily/weekly/monthly totals
- `GET /api/breakdown` - Get emissions by category

### AI Recommendations
- `GET /api/recommendations` - Get personalized suggestions

## 📱 Screenshots

<img width="1316" height="861" alt="image" src="https://github.com/user-attachments/assets/bc118882-1e43-410d-a001-c80255bf57d2" />
<img width="1821" height="507" alt="image" src="https://github.com/user-attachments/assets/78dc5315-98ad-4f04-a257-d550655ba35f" />
<img width="1769" height="735" alt="image" src="https://github.com/user-attachments/assets/d52354f3-46f7-47ad-871b-39654efb2a4b" />
<img width="1524" height="395" alt="image" src="https://github.com/user-attachments/assets/0f56fad8-16ed-41fc-9d07-f5d3520b248b" />
<img width="1548" height="759" alt="image" src="https://github.com/user-attachments/assets/c11e53b7-0ecc-480f-a9c2-f1e6f1f7bbf2" />
<img width="736" height="634" alt="image" src="https://github.com/user-attachments/assets/cfd9e7c6-b757-43c5-99ee-52d939fc7828" />


## 🤝 Contributing

This project was created as part of an assessment. Feel free to fork and enhance!

## 📄 License

MIT License

## 👤 Author

Created with ❤️ for a sustainable future 🌱by: Saransh Bhargava
