import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/tasks';

export const useTodoStore = create((set, get) => ({
  tasks: [],
  deletedTasks: [],
  deleteQueue: [],
  error: null,

  fetchTasks: async () => {
    try {
      set({ error: null });
      const [tasksRes, deletedRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(`${API_URL}/deleted`)
      ]);
      set({ tasks: tasksRes.data, deletedTasks: deletedRes.data });
    } catch (err) {
      set({ error: 'Failed to fetch tasks. Please ensure the server is running.' });
      console.error(err);
    }
  },

  addTask: async (title) => {
    try {
      const response = await axios.post(API_URL, { title });
      set((state) => ({ tasks: [response.data, ...state.tasks] }));
    } catch (err) {
      console.error('Failed to add task', err);
    }
  },

  toggleTask: async (id, completed) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, { completed: !completed });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? response.data : t))
      }));
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  },

  bulkDelete: () => {
    const { tasks, deleteQueue } = get();
    const idsToQueue = tasks
      .map(t => t.id)
      .filter(id => !deleteQueue.includes(id));
    
    set((state) => ({
      deleteQueue: [...state.deleteQueue, ...idsToQueue],
    }));
  },

  queueDelete: (id) => {
    set((state) => ({
      deleteQueue: [...state.deleteQueue, id],
    }));
  },

  processQueue: async () => {
    const { deleteQueue, tasks, deletedTasks } = get();
    if (deleteQueue.length === 0) return;

    const idToProcess = deleteQueue[0];
    const taskToMove = tasks.find(t => t.id === idToProcess);

    try {
      await axios.delete(`${API_URL}/${idToProcess}`);
      set({
        tasks: tasks.filter((t) => t.id !== idToProcess),
        deletedTasks: [...deletedTasks, { ...taskToMove, deleted: true }],
        deleteQueue: deleteQueue.filter((id) => id !== idToProcess),
      });
    } catch (err) {
      console.error(`Failed to process delete for task ${idToProcess}`, err);
      set({
        deleteQueue: deleteQueue.filter((id) => id !== idToProcess),
      });
    }
  },
}));
