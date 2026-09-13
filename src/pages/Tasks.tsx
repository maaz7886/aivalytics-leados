// src/pages/Tasks.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task } from '../types';
import { useNavigate } from 'react-router-dom';

export default function TasksPage() {
  const { tasks, toggleTaskStatus, addTask, setSelectedLeadId } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'Today' | 'Overdue' | 'Upcoming' | 'Completed'>('Today');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [taskLeadName, setTaskLeadName] = useState('Rahul Sharma');
  const [taskType, setTaskType] = useState<Task['type']>('Call');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('High');
  const [taskDueDate, setTaskDueDate] = useState('Today 3:00 PM');
  const [taskDesc, setTaskDesc] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'Completed') return t.status === 'Completed';
    if (activeTab === 'Overdue') return t.status === 'Overdue';
    if (activeTab === 'Today') return t.status === 'Pending' && t.dueDate.includes('Today');
    return t.status === 'Pending';
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      leadId: 'lead-rahul-001',
      leadName: taskLeadName,
      type: taskType,
      dueDate: taskDueDate,
      priority: taskPriority,
      status: 'Pending',
      description: taskDesc || 'Follow up with prospect on AI curriculum modules.',
      assignedTo: 'Alex Rivera'
    };
    addTask(newTask);
    setShowAddModal(false);
    setTaskDesc('');
  };

  const handleViewLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    navigate('/ai');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks Management</h1>
          <p className="text-sm text-gray-500">Track calls, WhatsApp outreach, payment follow-ups, and scheduled meetings.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center gap-2"
        >
          <span>➕</span> + Add New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-4 text-sm font-semibold">
        {(['Today', 'Overdue', 'Upcoming', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 border-b-2 transition-all ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
            No {activeTab.toLowerCase()} tasks found.
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between gap-4 hover:border-primary-200 transition-all"
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={t.status === 'Completed'}
                  onChange={() => toggleTaskStatus(t.id)}
                  className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{t.leadName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {t.type}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                        t.priority === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : t.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{t.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-500">📅 {t.dueDate}</span>
                <button
                  onClick={() => handleViewLead(t.leadId)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 hover:text-primary-700 text-xs font-bold rounded-lg transition-all"
                >
                  View Lead
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Lead Name</label>
                <input
                  type="text"
                  value={taskLeadName}
                  onChange={(e) => setTaskLeadName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Call">Call</option>
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Payment Follow-Up">Payment Follow-Up</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Due Date</label>
                <input
                  type="text"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Description</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg shadow"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
