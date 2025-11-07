# MenstruCare - Menstrual Hygiene Management System

A comprehensive digital platform for anonymous reporting, real-time monitoring, and improving menstrual hygiene infrastructure in educational institutions.

## Features

- 🔐 **Authentication System** - User and Admin login/signup
- 📊 **Real-time Dashboard** - View reports, updates, and statistics
- 🗺️ **Heatmap Visualization** - Issue distribution by location and category
- 📝 **Anonymous Reporting** - Submit issues anonymously or authenticated
- 🔔 **Admin Updates** - Track resolved issues
- 📍 **Washroom Status** - Real-time status of all facilities
- 🎨 **Modern UI** - Beautiful Material-UI interface

## Prerequisites

Before running this project, make sure you have the following installed:

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download Node.js](https://nodejs.org/)
3. **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)

## Project Structure

```
DeathOfMe-main/
├── backend/          # Flask backend API
│   ├── app/
│   │   ├── routes/   # API routes
│   │   └── ...
│   ├── requirements.txt
│   └── run.py
└── frontend/         # React frontend
    ├── src/
    │   ├── pages/    # Page components
    │   ├── components/ # Reusable components
    │   └── contexts/ # React contexts
    └── package.json
```

## Setup Instructions

### 1. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update the `MONGO_URI` in `.env` file (see step 2 below)

### 2. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file (optional):**
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/periodpal
   JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
   ```
   
   **Note:** If you don't create a `.env` file, the app will use default values:
   - `MONGO_URI`: `mongodb://localhost:27017/periodpal`
   - `JWT_SECRET_KEY`: `super-secret-key`

5. **Run the backend server:**
   ```bash
   python run.py
   ```
   
   The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Running the Project

### Step 1: Start MongoDB
Make sure MongoDB is running on your system (see MongoDB Setup above).

### Step 2: Start Backend Server
```bash
cd backend
# Activate virtual environment if using one
python run.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Step 3: Start Frontend Server
Open a new terminal:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Access the Application
Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Usage Guide

### 1. Create an Account
- Click "Get Started" or "Sign Up" on the homepage
- Choose "User Signup" or "Admin Signup"
- Enter your email and password
- You'll be automatically logged in and redirected to your dashboard

### 2. Submit a Report
- Click "Report Issue" on the homepage or dashboard
- Select issue type, location, and add details
- Optionally upload an image
- Submit the report (can be anonymous)

### 3. View Dashboard
- **User Dashboard**: View recent reports, your reports, admin updates, and washroom status
- **Admin Dashboard**: View all reports, resolve issues, manage users, and view heatmap

### 4. View Heatmap
- Login as Admin
- Go to Admin Dashboard
- Click on "Heatmap" tab
- View issue distribution by location and category

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Signup

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Submit a report
- `GET /api/my-reports` - Get user's reports (requires auth)
- `POST /api/reports/<id>/resolve` - Resolve a report (admin)

### Analytics
- `GET /api/washroom-status` - Get washroom status
- `GET /api/heatmap` - Get heatmap data

### Admin
- `GET /api/admin/updates` - Get admin updates
- `POST /api/admin/resolve` - Create admin update
- `POST /api/admin/resolve-confirm` - Confirm resolution

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError` or import errors
- **Solution:** Make sure you've installed all requirements: `pip install -r requirements.txt`

**Problem:** `pymongo.errors.ServerSelectionTimeoutError`
- **Solution:** Check if MongoDB is running. For local: `mongod` should be running. For Atlas: Check your connection string.

**Problem:** Port 5000 already in use
- **Solution:** Change the port in `run.py` or stop the process using port 5000

### Frontend Issues

**Problem:** `npm install` fails
- **Solution:** Make sure you have Node.js 16+ installed. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

**Problem:** Cannot connect to backend
- **Solution:** Make sure backend is running on `http://localhost:5000`. Check if there are CORS issues.

**Problem:** Port 5173 already in use
- **Solution:** Vite will automatically use the next available port, or you can specify a port: `npm run dev -- --port 3000`

### Database Issues

**Problem:** Data not persisting
- **Solution:** Check MongoDB connection. Verify the database name in `MONGO_URI` is correct.

**Problem:** Collections not created
- **Solution:** Collections are created automatically when you insert data. Try submitting a report.

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection String
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/periodpal

# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/periodpal

# JWT Secret Key (change this in production!)
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
```

## Production Deployment

### Backend
1. Set `FLASK_ENV=production`
2. Use a production WSGI server like Gunicorn
3. Set strong `JWT_SECRET_KEY`
4. Use environment variables for sensitive data
5. Enable HTTPS

### Frontend
1. Build the production bundle: `npm run build`
2. Serve the `dist` folder with a web server (nginx, Apache, etc.)
3. Update API URLs to point to production backend
4. Enable HTTPS

## Technologies Used

### Backend
- Flask - Python web framework
- Flask-JWT-Extended - JWT authentication
- Flask-PyMongo - MongoDB integration
- Flask-CORS - Cross-origin resource sharing
- python-dotenv - Environment variable management

### Frontend
- React - JavaScript library
- Material-UI - UI component library
- React Router - Routing
- Axios - HTTP client
- Vite - Build tool

### Database
- MongoDB - NoSQL database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
