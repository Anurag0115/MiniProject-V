# Quick Start Guide

## Quick Setup (5 minutes)

### 1. Install MongoDB
- **Windows/Mac**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Or use MongoDB Atlas** (free cloud): [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

### 2. Start MongoDB
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### 3. Setup Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

### 4. Setup Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 5. Open Browser
Go to: http://localhost:5173

## That's it! 🎉

You can now:
1. Sign up for an account
2. Submit reports
3. View dashboards
4. Check heatmap (admin only)

## Default Configuration

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Database**: MongoDB on localhost:27017
- **Database Name**: periodpal

No `.env` file needed for local development - it uses defaults!

## Need Help?

See [README.md](README.md) for detailed instructions.

