import React, { useEffect, useState } from 'react';
import { useTodoStore } from './store';

const App = () => {
  const [newTitle, setNewTitle] = useState('');
  const { 
    tasks, 
    deletedTasks,
    deleteQueue, 
    fetchTasks, 
    addTask,
    toggleTask,
    bulkDelete,
    queueDelete, 
    processQueue, 
    error 
  } = useTodoStore();

  useEffect(() => {
    fetchTasks();

    const interval = setInterval(() => {
      processQueue();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchTasks, processQueue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTask(newTitle);
    setNewTitle('');
  };

  const allQueued = tasks.length > 0 && tasks.every(t => deleteQueue.includes(t.id));

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Active Tasks Column */}
        <div className="bg-white shadow-lg rounded-lg p-6 h-fit">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Active Tasks
            </h1>
            {tasks.length > 0 && (
              <button
                onClick={bulkDelete}
                disabled={allQueued}
                className={`text-xs font-black uppercase px-3 py-1.5 rounded-md transition-all ${
                  allQueued
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200'
                }`}
              >
                Bulk Delete
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </form>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {tasks.length === 0 && !error && (
              <p className="text-center text-gray-400 py-10 italic">No active tasks. Add one above!</p>
            )}

            {tasks.map((task) => {
              const isPending = deleteQueue.includes(task.id);

              return (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    isPending ? 'bg-orange-50 border-orange-200 opacity-70 animate-pulse' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 mr-4 flex items-center gap-3">
                    <button 
                      onClick={() => !isPending && toggleTask(task.id, task.completed)}
                      disabled={isPending}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        task.completed ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="overflow-hidden">
                      <p className={`text-gray-700 font-medium break-words whitespace-normal ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </p>
                      {isPending && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase">
                          Queued
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => queueDelete(task.id)}
                    disabled={isPending}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                      isPending 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-bold uppercase tracking-wider flex justify-between">
            <span>Total: {tasks.length}</span>
            <span className="text-orange-500">In Queue: {deleteQueue.length}</span>
          </div>
        </div>

        {/* Deleted Tasks Column */}
        <div className="bg-gray-50 shadow-inner rounded-lg p-6 border-2 border-dashed border-gray-200 h-fit">
          <h2 className="text-2xl font-bold text-gray-500 mb-6 border-b border-gray-200 pb-2">
            Archived
          </h2>

          <div className="space-y-3 opacity-60">
            {deletedTasks.length === 0 && (
              <p className="text-center text-gray-400 py-10 italic">Archive is empty.</p>
            )}

            {deletedTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Deleted</span>
                  <p className="text-gray-500 line-through break-words whitespace-normal text-sm italic">
                    {task.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
