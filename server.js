const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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
app.post('/api/tasks', (req, res) => {
    try {
        const data = readData();
        const newTask = {
            id: Date.now(),
            ...req.body,
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
        const initialLength = data.tasks.length;
        data.tasks = data.tasks.filter(task => task.id !== taskId);
        
        if (data.tasks.length === initialLength) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
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
