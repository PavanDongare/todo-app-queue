# Todo Queue: High-Scale Architecture Simulation

This project is a technical demonstration of **Asynchronous Background Processing** using the **Producer-Broker-Consumer** pattern. While it looks like a simple Todo app, the underlying engineering is a simulation of how systems like Netflix, Uber, or Amazon handle high-load tasks (e.g., video transcoding, order processing, or large-scale data deletion).

---

## 🎯 Project Goal
The primary objective was to move beyond a standard synchronous CRUD app and implement **Eventual Consistency**. By decoupling the "User Request" from the "Resource Intensive Work," we ensure a high-performance, non-blocking User Experience.

---

## 🏗 Technical Architecture: The "Producer-Broker-Consumer" Pattern

In our application, every deletion follows a distributed systems lifecycle:

### 1. The Producer (API Layer)
**Location:** `server/routes/tasks.js` (`DELETE` & `POST /bulk-delete`)
*   **The Logic**: When a user clicks "Delete," the API doesn't touch the database immediately. It updates the task status to `pending` and **produces** a job by pushing the Task ID into the Broker.
*   **The Response**: It immediately returns an **HTTP 202 Accepted** status. This tells the client: *"I've received your request and queued it. You are free to keep working."*

### 2. The Broker (Message Storage)
**Location:** `server/routes/tasks.js` (`let deleteQueue = []`)
*   **The Logic**: This is our in-memory **Waiting Room**. It holds the jobs in a **FIFO (First-In, First-Out)** sequence, ensuring that tasks are processed in the order they were received.
*   **In Production**: This would be replaced by **RabbitMQ** or **Redis**.

### 3. The Consumer (Background Worker)
**Location:** `server/routes/tasks.js` (`setInterval` block)
*   **The Logic**: This is a perpetual **Background Process** (Worker). It runs every 2 seconds, independent of the UI. It **polls** the Broker, pulls one job at a time, and executes the final deletion.
*   **The Benefit**: This provides **Throttling**. Even if a user triggers 1,000 deletes, the backend only processes one every 2 seconds, protecting the server from "CPU Spikes" or "Database Locks."

### 4. The Observer (Sync Layer)
**Location:** `client/src/App.jsx` (`useEffect` polling)
*   **The Logic**: Since the worker is asynchronous, the Frontend **polls** the Backend every 1 second. This creates **Eventual Consistency**: the UI pulses "Pending" until the backend worker completes its task, at which point the next poll reflects the change.

---

## 📊 Prototype vs. Production: Technical Trade-offs

| Component | **Our Prototype (Simulation)** | **Real Production System (Ideal)** | **Why the Difference?** |
| :--- | :--- | :--- | :--- |
| **Worker Trigger** | **Polling (`setInterval`)**: The worker checks the queue every 2s. | **Event-Driven (Push)**: The Broker "pushes" the job to the worker instantly. | **Efficiency**: Polling uses CPU cycles even when empty. Push-based models are "Idle" until work arrives. |
| **Queue Storage** | **In-Memory Array**: Jobs live in the Node.js RAM. | **Persistent Message Queue**: RabbitMQ, Amazon SQS, or Redis. | **Reliability**: If our server restarts, the queue is lost. Production brokers save jobs to disk. |
| **Scaling** | **Monolithic**: API and Worker live in the same process. | **Microservices**: API and Worker run on different clusters. | **Elasticity**: Prod systems scale workers independently of the API to handle massive backlogs. |
| **UI Sync** | **HTTP Polling**: Client asks "Is it done?" every 1s. | **WebSockets / SSE**: Server pushes "Done" events to the client. | **Network Load**: Polling is chatty. WebSockets provide real-time updates with minimal overhead. |

---

## 🧪 Engineering Nuances to Review

### ❓ Why use HTTP 202 Accepted?
In RESTful architecture, `202` is specifically reserved for asynchronous operations. It acknowledges that the request is valid but the action hasn't finished yet. This is a hallmark of **Senior-level API Design**.

### ❓ What is "Eventual Consistency"?
It means the system will eventually be in a consistent state, but not immediately. In our app, the "Archived" list is eventually updated. This is how high-scale systems (like Facebook likes or YouTube view counts) stay fast without slowing down the entire global database for every single click.

### ❓ What is the "Thundering Herd" Problem?
Imagine 10,000 users all clicking delete at once. Our **Consumer Worker** prevents this from crashing the server by forcing the deletions into a "slow and steady" 2-second rhythm. It acts as a **Shock Absorber** for the backend.

---

## 🛠 Tech Stack
- **Frontend**: React 19, Zustand (Granular state updates), Tailwind CSS v4.
- **Backend**: Node.js, Express.js (Stateful API simulation).
- **Architecture**: Producer-Broker-Consumer, Polling, Async Worker.

---

## 🏃‍♂️ Run Locally
1. **Server**: `cd server && npm install && node index.js`
2. **Client**: `cd client && npm install && npm run dev`
