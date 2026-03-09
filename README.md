# Todo Queue Architecture & API Documentation

A modern React + Node.js application demonstrating **asynchronous background processing** for state synchronization using a BullMQ/RabbitMQ-inspired pattern.

---

## 🏗 System Architecture

### 📊 Data Flow (Simplified)
```text
[ USER UI ] 
    |
    | (1) Action: "Delete"
    v
[ ZUSTAND STORE ] <--- (2) Enqueue Task ID
    |
    | (3) Background Worker (setInterval 2s)
    v
[ EXPRESS BACKEND ] <--- (4) Execute DELETE /api/tasks/:id
    |
    | (5) Success Response
    v
[ ZUSTAND STORE ] <--- (6) Move Task to "Archived"
```

---

## 🧠 Engineering Behind the Queue (The Simulation)

This project isn't just a todo list; it's a **distributed systems simulation**. Here is how our architecture maps to professional message brokers like **RabbitMQ** or **BullMQ**:

### 1. The Broker (Zustand Store)
In a production app, you wouldn't delete a heavy resource (like a 5GB video file) in the main request/response cycle. 
- **In this app**: The `deleteQueue` array in our Zustand store acts as the **Message Broker**. 
- **Parity**: Just like RabbitMQ holds messages in a queue until a worker is ready, our store holds task IDs.

### 2. The Producer (UI Actions)
When you click "Delete" or "Bulk Delete", the UI doesn't wait for the backend to finish. 
- **In this app**: The `queueDelete` function is the **Producer**. It fire-and-forgets the ID into the queue.
- **Parity**: Similar to a web server pushing a "Job" to a RabbitMQ exchange and immediately returning a 202 Accepted status to the user.

### 3. The Consumer (Background Worker)
The `processQueue` function is the most critical part of the engineering.
- **In this app**: It runs every 2 seconds, independent of user interaction. It pulls the **oldest** ID (FIFO - First In, First Out) and processes it.
- **Parity**: This is a **Worker/Consumer**. It ensures the system doesn't "burst" the API. If you bulk delete 50 items, the backend receives them at a steady, manageable rate (1 every 2s), preventing server crashes or rate-limiting.

---

## 🚀 API Documentation

The backend is a RESTful service running on `http://localhost:5001`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Returns active tasks. |
| `GET` | `/api/tasks/deleted` | Returns archived tasks. |
| `POST` | `/api/tasks` | Creates a new task. |
| `PATCH` | `/api/tasks/:id` | Toggles task completion. |
| `DELETE` | `/api/tasks/:id` | Marks task as deleted. |
| `POST` | `/api/tasks/reset` | Resets system to initial state. |

---

## ⚡️ Bulk Deletion & "Pulsing" State
To visualize the asynchronous nature, we use a **Pulsing UI state**. While an ID is in the queue, the UI shows a "Queued" badge. This demonstrates **Eventual Consistency**: the UI knows the item *will* be deleted, even though the backend hasn't been notified yet.

---

## 🏃‍♂️ How to Run

1. **Terminal 1 (Backend)**:
   ```bash
   cd server && npm install && node index.js
   ```
2. **Terminal 2 (Frontend)**:
   ```bash
   cd client && npm install && npm run dev
   ```
