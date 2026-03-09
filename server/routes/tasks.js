const express = require('express');
const axios = require('axios');
const router = express.Router();

let tasks = [];
let isInitialized = false;

const initializeTasks = async () => {
  if (isInitialized) return;
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos?_limit=10');
    tasks = response.data.map(t => ({ ...t, deleted: false }));
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize tasks:', error.message);
  }
};

// GET /api/tasks -> List all active tasks
router.get('/', async (req, res) => {
  await initializeTasks();
  res.status(200).json(tasks.filter(t => !t.deleted));
});

// GET /api/tasks/deleted -> List deleted tasks
router.get('/deleted', async (req, res) => {
  await initializeTasks();
  res.status(200).json(tasks.filter(t => t.deleted));
});

// POST /api/tasks -> Create a new task
router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newTask = {
    userId: 1,
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    completed: false,
    deleted: false
  };

  tasks.unshift(newTask); // Add to the beginning
  res.status(201).json(newTask);
});

// PATCH /api/tasks/:id -> Update a task (e.g., toggle completed)
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));

  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    res.status(200).json(tasks[taskIndex]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// DELETE /api/tasks/:id -> Mark as deleted
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));

  if (taskIndex !== -1) {
    tasks[taskIndex].deleted = true;
    res.status(200).json({ message: 'Task deleted successfully' });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

module.exports = router;
