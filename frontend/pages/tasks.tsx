import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { tasksAPI, projectsAPI, usersAPI } from '../lib/api';
import { Task, Project, User } from '../lib/api';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  assignedToId: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string;
}

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormData>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        tasksAPI.getAll(),
        projectsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        // Update existing task
        const response = await tasksAPI.update(editingTask.id, {
          ...data,
          assignedToId: data.assignedToId || undefined,
        });
        setTasks(prev => prev.map(t => t.id === editingTask.id ? response.data : t));
        toast.success('Task updated successfully!');
      } else {
        // Create new task
        const response = await tasksAPI.create({
          ...data,
          assignedToId: data.assignedToId || undefined,
        });
        setTasks(prev => [response.data, ...prev]);
        toast.success('Task created successfully!');
      }
      setShowForm(false);
      setEditingTask(null);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${editingTask ? 'update' : 'create'} task`);
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
    try {
      await tasksAPI.update(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
    
    // Pre-fill form with task data
    setValue('title', task.title);
    setValue('description', task.description);
    setValue('projectId', task.project.id);
    setValue('assignedToId', task.assignedTo?.id || '');
    setValue('priority', task.priority);
    setValue('status', task.status);
    setValue('due_date', task.due_date || '');
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingTask(null);
    reset();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track your tasks across all projects.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'todo', 'in_progress', 'done'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Create/Edit Task Form */}
        {showForm && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="input mt-1"
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <select
                    {...register('projectId', { required: 'Project is required' })}
                    className="input mt-1"
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  className="input mt-1"
                  rows={3}
                  placeholder="Enter task description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                  <select
                    {...register('assignedToId')}
                    className="input mt-1"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    {...register('priority', { required: 'Priority is required' })}
                    className="input mt-1"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="input mt-1"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  {...register('due_date')}
                  type="date"
                  className="input mt-1"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks found. Create your first task!</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Project: {task.project.name}</span>
                      {task.assignedTo && <span>Assigned to: {task.assignedTo.name}</span>}
                      {task.due_date && (
                        <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {task.status !== 'done' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'done')}
                        className="text-green-600 hover:text-green-800"
                        title="Mark as done"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => handleEditTask(task)}
                      title="Edit task"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default TasksPage;
