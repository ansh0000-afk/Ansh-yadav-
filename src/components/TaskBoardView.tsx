import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { analyzeContent } from '../lib/geminiHelper';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  Circle,
  Play,
  Wand2,
  Loader2
} from 'lucide-react';

interface TaskBoardViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
  onAskAgentAboutTask: (taskTitle: string) => void;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onAskAgentAboutTask
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiBreakdown = async () => {
    if (!newTitle.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await analyzeContent({
        taskType: 'summarize',
        text: `Break down the following task into 3-4 actionable sub-steps with checkboxes:\n"${newTitle}"`
      });
      if (res.result) {
        setNewDescription(res.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      priority: newPriority,
      status: 'todo',
      dueDate: newDueDate.trim() || undefined
    });

    setNewTitle('');
    setNewDescription('');
    setNewPriority('medium');
    setNewDueDate('');
    setShowAddModal(false);
  };

  const priorityColors = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-zinc-100 text-zinc-600 border-zinc-200'
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#fafafa] text-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-zinc-900">Personal Action Board</h2>
            <p className="text-xs text-zinc-500">Track and manage tasks assigned to or created by your AI Agent</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 bg-white/60 border-b border-zinc-200 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-zinc-500 font-medium flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>

        {['all', 'todo', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all border ${
              filterStatus === status
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task List Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mx-auto text-zinc-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">No tasks found for this view.</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Ask your AI Agent in chat (e.g. "Remind me to submit Q3 budget tomorrow") to automatically create tasks!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl bg-white border transition-all flex flex-col justify-between space-y-3 shadow-xs ${
                  task.status === 'completed'
                    ? 'border-zinc-200 opacity-60'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() =>
                        onUpdateTaskStatus(
                          task.id,
                          task.status === 'completed' ? 'todo' : 'completed'
                        )
                      }
                      className="flex items-center gap-2 text-left group"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 shrink-0 mt-0.5 transition-colors" />
                      )}
                      <h3
                        className={`font-semibold text-sm text-zinc-900 ${
                          task.status === 'completed' ? 'line-through text-zinc-400 font-normal' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-zinc-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 pl-7">{task.description}</p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${
                        priorityColors[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>

                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-zinc-500 text-[11px]">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{task.dueDate}</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onAskAgentAboutTask(task.title)}
                    className="flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-900 transition-colors font-medium"
                    title="Ask Agent to assist with task"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Agent Assist</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-zinc-900">Create New Task</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Finalize quarterly architecture diagram"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-700">Description (Optional)</label>
                  <button
                    type="button"
                    onClick={handleAiBreakdown}
                    disabled={isAiLoading || !newTitle.trim()}
                    className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 disabled:opacity-40"
                  >
                    {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 text-emerald-500" />}
                    <span>AI Breakdown Steps</span>
                  </button>
                </div>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add additional checklist or context..."
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Due Date</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="e.g. Today, 2026-08-10"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-medium hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800"
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
};
