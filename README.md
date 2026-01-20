# Aisle Tracker

A shared task and issue management system for store aisles.

## Features

- Report new items added
- Track missing price tags
- Log audits
- Manage subscription requirements
- Just 4 U issue tracking
- Automatic cleanup of tasks older than 14 days
- Real-time shared data across all users

## Setup

### Installation

1. Install Node.js (if not already installed) from https://nodejs.org/

2. Install dependencies:
```bash
npm install
```

### Running Locally

Start the server:
```bash
npm start
```

The app will be available at: http://localhost:3000

For development with auto-restart:
```bash
npm run dev
```

## Deploying Online

### Option 1: Render.com (Free & Easy)

1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (or upload files)
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Create Web Service"
6. Your app will be live at: `https://your-app-name.onrender.com`

### Option 2: Railway.app

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Node.js and deploys
5. Your app will be live with a provided URL

### Option 3: Heroku

1. Install Heroku CLI
2. Run:
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Option 4: DigitalOcean App Platform

1. Create account at https://www.digitalocean.com
2. Go to App Platform → Create App
3. Connect repository or upload
4. Configure and deploy

## Data Storage

Tasks are stored in `data.json` on the server. The file is automatically created on first run.

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `DELETE /api/tasks/:id` - Delete a task

## Notes

- Tasks automatically expire after 14 days
- All users share the same data in real-time
- Data persists across server restarts
