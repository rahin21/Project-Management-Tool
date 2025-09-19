import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, usersAPI } from '../lib/api';
import { Project, User } from '../lib/api';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ProjectFormData {
  name: string;
  description: string;
  ownerEmail: string;
}

interface EditProjectData {
  name: string;
  description: string;
}

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit, formState: { errors: errorsEdit } } = useForm<EditProjectData>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        projectsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const response = await projectsAPI.create(data);
      setProjects(prev => [response.data, ...prev]);
      setShowForm(false);
      reset();
      toast.success('Project created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const onEditSubmit = async (data: EditProjectData) => {
    if (!editingProject) return;
    
    try {
      const response = await projectsAPI.update(editingProject.id, data);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? response.data : p));
      setEditingProject(null);
      resetEdit();
      toast.success('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setValueEdit('name', project.name);
    setValueEdit('description', project.description || '');
  };

  const handleDelete = async (project: Project) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsAPI.delete(project.id);
      setProjects(prev => prev.filter(p => p.id !== project.id));
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
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
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your projects and track their progress.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Project
          </button>
        </div>

        {/* Create Project Form */}
        {showForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Project name is required' })}
                  className="input"
                  placeholder="Enter project name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="input"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Email
                </label>
                <select
                  {...register('ownerEmail', { required: 'Owner is required' })}
                  className="input"
                >
                  <option value="">Select owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.ownerEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.ownerEmail.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Project Form */}
        {editingProject && (
          <div className="card mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Project</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  {...registerEdit('name', { required: 'Project name is required' })}
                  className="input"
                  placeholder="Enter project name"
                />
                {errorsEdit.name && (
                  <p className="text-red-500 text-sm mt-1">{errorsEdit.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...registerEdit('description')}
                  className="input"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Update Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    resetEdit();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No projects yet. Create your first project!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(project)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Owner:</span>
                    <span className="font-medium">{project.owner?.name || 'No owner assigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
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

export default ProjectsPage;
