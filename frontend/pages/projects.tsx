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

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>();

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
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  {...register('name', { required: 'Project name is required' })}
                  className="input mt-1"
                  placeholder="Enter project name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  className="input mt-1"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Owner</label>
                <select
                  {...register('ownerEmail', { required: 'Owner is required' })}
                  className="input mt-1"
                >
                  <option value="">Select owner</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                {errors.ownerEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.ownerEmail.message}</p>
                )}
              </div>

              <div className="flex gap-3">
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
                    <button className="text-gray-400 hover:text-gray-600">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
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
                    <span className="font-medium">{project.owner.name}</span>
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
