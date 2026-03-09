# Todo Queue Architecture & API Documentation

A modern React + Node.js application demonstrating **asynchronous background processing** for state synchronization using a BullMQ-inspired queue pattern.

---

## 🏗 System Architecture

### 🔄 The "Slow Delete" Workflow (Queue Simulation)
To simulate high-load background jobs (like video processing or data indexing), deletions are decoupled from the UI:

1.  **Trigger**: User clicks 'Delete' or 'Bulk Delete'.
2.  **Enqueue**: Task IDs are pushed into the `deleteQueue` in the **Zustand Store**.
3.  **UI Feedback**: Tasks immediately show a `Queued` state (pulsing animation) and the delete button is disabled.
4.  **Processor**: A `setInterval` (2s) acts as a **Worker**. It pops the first ID from the queue.
5.  **Execution**: The Worker calls `DELETE /api/tasks/:id`.
6.  **Finalize**: Upon 200 OK, the task is moved from `tasks` to `deletedTasks` in the store.

### 📊 Data Flow Diagram
```mermaid
graph LR
    subgraph Frontend (React + Zustand)
    A[UI Component] -->|Action| B(Zustand Store)
    B -->|Interval 2s| C{Delete Queue}
    C -->|Process ID| D[Axios API Call]
    end

    subgraph Backend (Node.js + Express)
    D --> E[Express Router]
    E -->|Modify| F[(In-Memory RAM Store)]
    F -.->|Initial Load| G[JSONPlaceholder API]
    end

    D -->|Success| B
```

---

## 🚀 API Documentation

The backend is a RESTful service running on `http://localhost:5001`.

### Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Returns all active (non-deleted) tasks. |
| `GET` | `/api/tasks/deleted` | Returns all archived (deleted) tasks. |
| `POST` | `/api/tasks` | Creates a new task. Body: `{ "title": string }`. |
| `PATCH` | `/api/tasks/:id` | Updates a task (e.g., toggle `completed`). Body: `{ "completed": boolean }`. |
| `DELETE` | `/api/tasks/:id` | Marks a task as `deleted: true`. |

---

## ⚡️ Feature: Bulk Deletion Demo

The **Bulk Delete** feature is designed to showcase the queue in action:
1. When triggered, it maps all current `tasks` to the `deleteQueue`.
2. You will see the entire list enter a "Pending" state.
3. The items will disappear from the active list and appear in the "Archived" section **one by one every 2 seconds**.
4. This prevents "bursting" the API and demonstrates how a system handles a large backlog of background jobs without freezing the main thread.

---

## 🛠 Tech Stack & Decisions

-   **Frontend**: React 19 + Vite (Fast HMR).
-   **State**: **Zustand**. Chosen for its "Action" pattern which allows complex logic (like the queue interval) to be co-located with the state.
-   **Styling**: **Tailwind CSS v4**. Utilizes the new `@tailwindcss/vite` plugin for lightning-fast builds and `break-words` for fluid layout.
-   **Backend**: **Express.js**. Acts as a stateful proxy for the session.

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
