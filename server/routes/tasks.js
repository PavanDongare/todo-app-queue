const express = require('express');
const router = express.Router();

const INITIAL_TASKS = [
  { id: 1, title: "Buy groceries for the week", completed: false, status: 'active' },
  { id: 2, title: "Clean the kitchen and living room", completed: true, status: 'active' },
  { id: 3, title: "Send email to the project manager", completed: false, status: 'active' },
  { id: 4, title: "Walk the dog in the park", completed: false, status: 'active' },
  { id: 5, title: "Prepare presentation for Monday meeting", completed: false, status: 'active' },
  { id: 6, title: "Call mom for her birthday", completed: true, status: 'active' },
  { id: 7, title: "Fix the leaking faucet", completed: false, status: 'active' },
  { id: 8, title: "Read 20 pages of a new book", completed: false, status: 'active' },
  { id: 9, title: "Update the software on my laptop", completed: false, status: 'active' },
  { id: 10, title: "Water the indoor plants", completed: true, status: 'active' }
];

let tasks = INITIAL_TASKS.map(t => ({ ...t }));
let deleteQueue = [];

// --- BACKEND WORKER (Simulation of BullMQ/RabbitMQ Consumer) ---
setInterval(() => {
  if (deleteQueue.length > 0) {
    const idToProcess = deleteQueue.shift();
    const taskIndex = tasks.findIndex(t => t.id === idToProcess);
    
    if (taskIndex !== -1) {
      tasks[taskIndex].status = 'deleted';
      console.log(`[Worker] Processed and Deleted Task ID: ${idToProcess}`);
    }
  }
}, 2000);

// GET /api/tasks -> List all active and pending tasks
router.get('/', (req, res) => {
  res.status(200).json(tasks.filter(t => t.status === 'active' || t.status === 'pending'));
});

// GET /api/tasks/deleted -> List deleted tasks
router.get('/deleted', (req, res) => {
  res.status(200).json(tasks.filter(t => t.status === 'deleted'));
});

// POST /api/tasks/reset -> Reset system
router.post('/reset', (req, res) => {
  tasks = INITIAL_TASKS.map(t => ({ ...t }));
  deleteQueue = [];
  res.status(200).json({ message: 'System reset' });
});

// POST /api/tasks -> Create task
router.post('/', (req, res) => {
  const { title } = req.body;
  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    completed: false,
    status: 'active'
  };
  tasks.unshift(newTask);
  res.status(201).json(newTask);
});

// PATCH /api/tasks/:id -> Update task
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    res.status(200).json(tasks[taskIndex]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// DELETE /api/tasks/:id -> Enqueue for deletion
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const taskId = parseInt(id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex !== -1) {
    // 1. Move to pending status
    tasks[taskIndex].status = 'pending';
    // 2. Add to backend queue
    if (!deleteQueue.includes(taskId)) {
      deleteQueue.push(taskId);
    }
    console.log(`[Producer] Enqueued Task ID: ${taskId}`);
    res.status(202).json({ message: 'Task enqueued for deletion', taskId });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// POST /api/tasks/bulk-delete -> Enqueue multiple
router.post('/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'IDs array required' });

  ids.forEach(id => {
    const taskId = parseInt(id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1 && tasks[taskIndex].status === 'active') {
      tasks[taskIndex].status = 'pending';
      deleteQueue.push(taskId);
    }
  });

  res.status(202).json({ message: 'Bulk delete enqueued', count: ids.length });
});

module.exports = router;
