const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOAD_DIR));

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks: [] }, null, 2));
}

// Helper function to read data
function readData() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper function to write data
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Clean up old tasks (older than 14 days)
function cleanupOldTasks(tasks) {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    return tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate > fourteenDaysAgo;
    });
}

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
    try {
        const data = readData();
        // Clean up old tasks before returning
        data.tasks = cleanupOldTasks(data.tasks);
        writeData(data);
        res.json(data.tasks);
    } catch (error) {
        console.error('Error reading tasks:', error);
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

// Create a new task
app.post('/api/tasks', upload.single('image'), (req, res) => {
    try {
        const data = readData();
        const newTask = {
            id: Date.now(),
            type: req.body.type,
            aisle: req.body.aisle,
            section: req.body.section,
            startSection: req.body.startSection || null,
            endSection: req.body.endSection || null,
            itemName: req.body.itemName,
            description: req.body.description,
            reporterName: req.body.reporterName,
            just4u: req.body.just4u === 'true',
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        data.tasks.push(newTask);
        writeData(data);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const data = readData();
        const taskToDelete = data.tasks.find(task => task.id === taskId);
        
        if (!taskToDelete) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Delete associated image file if it exists
        if (taskToDelete.imageUrl) {
            const imagePath = path.join(__dirname, taskToDelete.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        data.tasks = data.tasks.filter(task => task.id !== taskId);
        writeData(data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Aisle Tracker server running on http://localhost:${PORT}`);
    console.log(`📊 Data stored in: ${DATA_FILE}`);
});
