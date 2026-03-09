import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api/tasks';

export const useTodoStore = create((set, get) => ({
  tasks: [],
  deletedTasks: [],
  error: null,

  fetchTasks: async () => {
    try {
      const [tasksRes, deletedRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(`${API_URL}/deleted`)
      ]);
      set({ tasks: tasksRes.data, deletedTasks: deletedRes.data, error: null });
    } catch (err) {
      set({ error: 'Failed to fetch tasks. Ensure the server is running.' });
      console.error(err);
    }
  },

  resetData: async () => {
    try {
      await axios.post(`${API_URL}/reset`);
      await get().fetchTasks();
    } catch (err) {
      console.error('Failed to reset system', err);
    }
  },

  addTask: async (title) => {
    try {
      await axios.post(API_URL, { title });
      await get().fetchTasks();
    } catch (err) {
      console.error('Failed to add task', err);
    }
  },

  toggleTask: async (id, completed) => {
    try {
      await axios.patch(`${API_URL}/${id}`, { completed: !completed });
      await get().fetchTasks();
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  },

  queueDelete: async (id) => {
    try {
      // Calls the backend DELETE which now enqueues the task
      await axios.delete(`${API_URL}/${id}`);
      await get().fetchTasks();
    } catch (err) {
      console.error(`Failed to delete task ${id}`, err);
    }
  },

  bulkDelete: async (ids) => {
    try {
      await axios.post(`${API_URL}/bulk-delete`, { ids });
      await get().fetchTasks();
    } catch (err) {
      console.error('Failed bulk delete', err);
    }
  },
}));
