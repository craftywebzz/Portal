"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GitHubProjectsService } from '@/lib/services/github-projects';
import { ProjectsService } from '@/lib/services/projects';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiGithub, FiRefreshCw, FiStar, FiGitBranch, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function GitHubSync() {
  const router = useRouter();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const githubService = new GitHubProjectsService();
      const repos = await githubService.fetchOrganizationRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/github/sync-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceRefresh: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync projects');
      }

      setSuccess(true);
      await fetchRepositories();
    } catch (error) {
      console.error('Error syncing projects:', error);
      setError(error.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">Loading repositories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            GitHub Projects Sync
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sync and manage projects from your GitHub organization with a single click
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-sm transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-8 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-sm transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center space-x-3">
              <FiCheck className="h-6 w-6 text-green-500" />
              <p className="text-green-600 dark:text-green-400 font-medium">
                Projects synced successfully!
              </p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Available Repositories
              </h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {repositories.length} repositories found
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105"
            >
              {syncing ? (
                <>
                  <FiRefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Syncing...
                </>
              ) : (
                <>
                  <FiRefreshCw className="-ml-1 mr-3 h-5 w-5" />
                  Sync Projects
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <FiGithub className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {repo.name}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2">
                  {repo.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <FiStar className="h-4 w-4 mr-1" />
                      {repo.stars}
                    </div>
                    <div className="flex items-center">
                      <FiGitBranch className="h-4 w-4 mr-1" />
                      {repo.forks}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    repo.status === 'archived' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                  }`}>
                    {repo.status === 'archived' ? 'Archived' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 