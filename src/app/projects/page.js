"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import React from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { FiFilter, FiSearch, FiGithub, FiStar, FiCode, FiUsers, FiRefreshCw, FiArrowLeft, FiPlus, FiAlertCircle, FiCheck } from "react-icons/fi";
import { projectsService } from '@/lib/services/projects';
import { GitHubProjectsService } from '@/lib/services/github-projects';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectsService } from '@/lib/services/projects';
import { supabase } from '@/lib/supabase';

export default function Projects() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyUserProjects, setShowOnlyUserProjects] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const projectsService = new ProjectsService();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    const checkAdmin = async () => {
      if (!user) return;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profileError && profile?.is_admin) {
        setIsAdmin(true);
      }
    };

    checkAdmin();
    fetchProjects();
  }, [user, authLoading, router]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch GitHub projects
      let githubProjects = [];
      try {
        const response = await fetch('/api/github/repos');
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        githubProjects = await response.json();
      } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        // Continue with local projects even if GitHub fetch fails
      }

      // Fetch local projects
      const localProjects = await projectsService.getAllProjects({
        search: searchTerm,
        userId: showOnlyUserProjects ? user?.id : null,
        status: selectedStatus !== 'all' ? selectedStatus : null,
        techStack: selectedTags.length > 0 ? selectedTags : null
      });

      // Combine and transform projects
      const allProjects = [
        ...githubProjects.map(project => ({
          ...project,
          isGitHubProject: true,
          isUserProject: false
        })),
        ...localProjects.map(project => ({
          ...project,
          isGitHubProject: false,
          isUserProject: project.created_by === user?.id || 
                        project.members?.some(m => m.user_id === user?.id && m.status === 'active')
        }))
      ];

      setProjects(allProjects);
      setFilteredProjects(allProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, selectedTags, showOnlyUserProjects, selectedStatus, user?.id]);

  // Refresh projects data
  const refreshProjects = async () => {
    try {
      setIsRefreshing(true);
      const githubProjectsService = new GitHubProjectsService();
      const githubProjects = await githubProjectsService.fetchOrganizationRepositories();
      
      let localProjects = [];
      if (showOnlyUserProjects && user?.id) {
        const filters = {
          userId: user.id,
          techStack: selectedTags
        };
        localProjects = await projectsService.getAllProjects(filters);
      }

      let allProjects = [...githubProjects, ...localProjects];
      
      if (searchTerm) {
        allProjects = allProjects.filter(project => 
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedTags.length > 0) {
        allProjects = allProjects.filter(project =>
          selectedTags.some(tag => 
            project.techStack.includes(tag) || project.tags.includes(tag)
          )
        );
      }

      setProjects(allProjects);
      setFilteredProjects(allProjects);
    } catch (err) {
      console.error('Error refreshing projects:', err);
      setError('Failed to refresh projects. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sync GitHub projects
  const syncGitHubProjects = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      setSyncSuccess(false);

      const response = await fetch('/api/github/sync-projects', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync projects');
      }

      setSyncSuccess(true);
      // Refresh the projects list
      await fetchProjects();
    } catch (err) {
      console.error('Error syncing GitHub projects:', err);
      setError(err.message || 'Failed to sync GitHub projects');
    } finally {
      setIsSyncing(false);
    }
  };

  const allTags = [...new Set(projects.flatMap((project) => project.tags))];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (showOnlyUserProjects) {
      params.set('myProjects', 'true');
    }
    if (selectedTags.length === 1) {
      params.set('tag', selectedTags[0]);
    }
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [showOnlyUserProjects, selectedTags, searchTerm]);

  useEffect(() => {
    updateUrlParams();
  }, [showOnlyUserProjects, selectedTags, searchTerm, updateUrlParams]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <div className="flex space-x-4">
            <button
              onClick={refreshProjects}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700"
            >
              <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {isAdmin && (
              <button
                onClick={syncGitHubProjects}
                disabled={isSyncing}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <FiGithub className="mr-2" />
                Sync GitHub
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-sm border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-4">
              {isAdmin && (
                <Link
                  href="/projects/new"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="mr-2" />
                  New Project
                </Link>
              )}
              <button
                onClick={() => setShowOnlyUserProjects(!showOnlyUserProjects)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  showOnlyUserProjects
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200 border border-gray-700'
                }`}
              >
                My Projects
              </button>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {allTags.filter(tag => tag).map((tag) => (
              <button
                key={`tag-${tag}`}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={`project-${project.id || project.numeric_id}`}
                className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-700 hover:border-blue-500 group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h2>
                    {project.isGitHubProject && (
                      <FiGithub className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags?.filter(tag => tag).map((tag) => (
                      <span
                        key={`project-${project.id}-tag-${tag}`}
                        className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-200 rounded-full group-hover:bg-gray-600 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>ID: {project.numeric_id || project.id}</span>
                    <span className="capitalize">{project.status}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <Link
                      href={`/projects/${project.id || project.numeric_id}`}
                      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <span>View Details</span>
                      <FiArrowLeft className="ml-2 transform rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {syncSuccess && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
            <FiCheck className="h-5 w-5" />
            <span>Projects synced successfully!</span>
          </div>
        )}
      </main>
    </div>
  );
}
