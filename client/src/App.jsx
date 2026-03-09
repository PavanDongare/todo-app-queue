import React, { useEffect, useState } from 'react';
import { useTodoStore } from './store';

const App = () => {
  const [newTitle, setNewTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const { 
    tasks, 
    deletedTasks,
    fetchTasks, 
    addTask,
    toggleTask,
    bulkDelete,
    resetData,
    queueDelete, 
    error 
  } = useTodoStore();

  useEffect(() => {
    // Initial fetch
    fetchTasks();

    // Polling every 1 second to see the backend "simulation" progress
    const interval = setInterval(() => {
      fetchTasks();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTask(newTitle);
    setNewTitle('');
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    await bulkDelete(selectedIds);
    setSelectedIds([]); 
  };

  const anySelectedActive = tasks.some(t => selectedIds.includes(t.id) && t.status === 'active');
  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 flex flex-col items-center">
      {/* System Reset Button */}
      <button 
        onClick={resetData}
        className="fixed top-4 right-4 bg-gray-800 text-white text-[10px] font-black px-3 py-2 rounded-full shadow-lg hover:bg-black transition-all uppercase tracking-widest z-50 flex items-center gap-2"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset System
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Active/Pending Column */}
        <div className="bg-white shadow-lg rounded-lg p-6 h-fit">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Tasks
            </h1>
            {selectedIds.length > 0 && anySelectedActive && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-md hover:bg-red-700 shadow-md transition-all flex items-center gap-2"
              >
                Delete Selected ({selectedIds.filter(id => tasks.find(t => t.id === id)?.status === 'active').length})
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
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
              <p className="text-center text-gray-400 py-10 italic text-sm">No active tasks.</p>
            )}

            {tasks.map((task) => {
              const isPending = task.status === 'pending';
              const isSelected = selectedIds.includes(task.id);

              return (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                    isPending ? 'bg-orange-50 border-orange-200 opacity-70 animate-pulse' : 'bg-white hover:border-blue-200 hover:shadow-sm'
                  } ${isSelected && !isPending ? 'border-blue-400 ring-1 ring-blue-400 bg-blue-50' : 'border-gray-100'}`}
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    {!isPending && (
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelection(task.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    )}
                    
                    <button 
                      onClick={() => !isPending && toggleTask(task.id, task.completed)}
                      disabled={isPending}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center ${
                        task.completed ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="overflow-hidden">
                      <p className={`text-gray-700 font-medium break-words whitespace-normal text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </p>
                      {isPending && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-200 text-orange-800 uppercase tracking-tighter">
                          Pending on Backend...
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => queueDelete(task.id)}
                    disabled={isPending}
                    className={`ml-3 p-2 rounded-full transition-all flex-shrink-0 ${
                      isPending 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-bold uppercase tracking-wider flex justify-between">
            <span>Tasks: {tasks.filter(t => t.status === 'active').length}</span>
            <span className="text-orange-500 font-black">Backend Queue: {pendingTasksCount}</span>
          </div>
        </div>

        {/* Recently Deleted Column */}
        <div className="bg-gray-50 shadow-inner rounded-lg p-6 border-2 border-dashed border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-500 mb-6 border-b border-gray-200 pb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
            </svg>
            Server Archived
          </h2>

          <div className="space-y-3 opacity-60">
            {deletedTasks.length === 0 && (
              <p className="text-center text-gray-400 py-10 italic text-sm">No archived tasks.</p>
            )}

            {deletedTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="bg-red-50 text-red-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-red-100 uppercase">Archived</span>
                  <p className="text-gray-500 line-through break-words whitespace-normal text-xs italic">
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
