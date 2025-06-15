"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiGithub,
  FiStar,
  FiCode,
  FiUsers,
  FiArrowLeft,
  FiCalendar,
  FiEdit3,
  FiExternalLink,
  FiPlus,
  FiX,
  FiUserPlus,
  FiGitBranch,
  FiGitPullRequest,
  FiGitCommit,
  FiAlertCircle,
  FiClock
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { projectsService } from "@/lib/services/projects";
import { GitHubProjectsService } from "@/lib/services/github-projects";
import { studentsService } from "@/lib/services/students";
import { GitHubService } from "@/lib/services/github";
import { ProjectsService } from "@/lib/services/projects";
import { toast } from "react-hot-toast";
import { StudentsService } from '@/lib/services/students';

// Mock data for projects (in a real app, this would come from an API)
const mockProjects = [
  {
    id: 1,
    name: "Student Management System",
    description: "A comprehensive system to manage student records, attendance, and performance.",
    longDescription: "The Student Management System is designed to streamline administrative tasks related to student data management. It provides features for tracking attendance, managing grades, scheduling classes, and generating reports. The system is built with a modern tech stack including React for the frontend, Node.js for the backend, and MongoDB for data storage.",
    tags: ["React", "Node.js", "MongoDB"],
    stars: 24,
    forks: 8,
    contributors: 5,
    owner: "john_doe",
    repoUrl: "https://github.com/nst-dev-club/student-management",
    demoUrl: "https://student-management-demo.vercel.app",
    isUserProject: true,
    createdAt: "2023-09-15T10:30:00Z",
    updatedAt: "2024-05-20T14:45:00Z",
    contributors: [
      { id: 1, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1", role: "Lead Developer" },
      { id: 2, name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=2", role: "Frontend Developer" },
      { id: 3, name: "Alex Wong", avatar: "https://i.pravatar.cc/150?img=3", role: "Backend Developer" },
      { id: 4, name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=4", role: "UI/UX Designer" },
      { id: 5, name: "Mike Brown", avatar: "https://i.pravatar.cc/150?img=5", role: "Database Engineer" },
    ],
    readme: `# Student Management System

## Overview
A comprehensive system to manage student records, attendance, and performance.

## Features
- Student registration and profile management
- Attendance tracking with reports
- Grade management and performance analytics
- Course scheduling and management
- Parent-teacher communication portal

## Tech Stack
- Frontend: React.js with Material UI
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- Deployment: Docker, AWS

## Getting Started
1. Clone the repository
2. Install dependencies with \`npm install\`
3. Set up environment variables
4. Run the development server with \`npm run dev\`

## Contributing
We welcome contributions! Please see our contributing guidelines for more details.`,
  },
  // More project data would be here...
];

const ProjectMemberCard = ({ member, onRemove, isLead }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      setIsRemoving(true);
      try {
        await onRemove(member.userId);
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
      } finally {
        setIsRemoving(false);
      }
    }
  };

  return (
    <div 
      className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}`}
              alt={member.name}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}`;
              }}
            />
            {isLead && (
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                Lead
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {member.name}
            </h4>
            {member.githubUsername && (
              <a
                href={`https://github.com/${member.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
              >
                @{member.githubUsername}
              </a>
            )}
          </div>
          {onRemove && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className={`p-1 rounded-full transition-colors duration-200 ${
                isHovered 
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                  : 'text-gray-400 hover:text-red-600'
              }`}
            >
              {isRemoving ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [students, setStudents] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [githubDetails, setGithubDetails] = useState(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const projectsService = new ProjectsService();
  const studentsService = new StudentsService();
  const githubService = new GitHubService();

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const project = await projectsService.getProjectById(id);
      setProject(project);
      setLoading(false);

      // Fetch project members
      const members = await projectsService.getProjectMembers(project.id);
      setProjectMembers(members);

      // Fetch available students
      const availableStudents = await studentsService.getAllStudents();
      setStudents(availableStudents);

      // Fetch GitHub details if it's a GitHub project
      if (project.github_repo_url) {
        const [owner, repo] = project.github_repo_url
          .replace('https://github.com/', '')
          .split('/');

        if (owner && repo) {
          setIsLoadingGithub(true);
          try {
            const details = await githubService.fetchRepositoryDetails(owner, repo);
            setGithubDetails(details);
          } catch (githubError) {
            console.error('Error fetching GitHub details:', githubError);
          } finally {
            setIsLoadingGithub(false);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchProjectDetails:', error);
      setError(error.message);
      setLoading(false);
      
      // If project not found, fetch available projects
      try {
        const availableProjects = await projectsService.getAllProjects();
        setAvailableProjects(availableProjects);
      } catch (listError) {
        console.error('Error fetching available projects:', listError);
      }
    }
  };

  const handleAssignStudent = async (studentId) => {
    try {
      await projectsService.assignStudentToProject(project.id, studentId, 'member');
      
      // Refresh project members
      const updatedMembers = await projectsService.getProjectMembers(project.id);
      setProjectMembers(updatedMembers);
      
      // Show success message
      toast.success('Student assigned successfully');
    } catch (error) {
      console.error('Error assigning student:', error);
      toast.error(error.message || 'Failed to assign student');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setError(null);
      
      // Confirm before removing
      if (!confirm('Are you sure you want to remove this member from the project?')) {
        return;
      }

      // Use project.id (UUID) instead of route parameter id
      await projectsService.removeMemberFromProject(project.id, memberId);
      
      // Refresh project members using project.id
      const updatedMembers = await projectsService.getProjectMembers(project.id);
      setProjectMembers(updatedMembers);
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error.message || 'Failed to remove member from project.');
    }
  };

  // Filter out students who are already members
  const availableStudentsForAssignment = students.filter(
    student => !projectMembers.some(member => member.userId === student.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Project</h2>
            <p className="text-red-200">{error}</p>
            <p className="text-gray-400 mt-4">The project you're looking for doesn't exist. Here are some available projects you might be interested in:</p>
          </div>

          {availableProjects && availableProjects.length > 0 ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Available Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-6 transition-colors"
                  >
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    <p className="text-gray-300 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>ID: {project.numeric_id || project.id}</span>
                      <span className="capitalize">{project.status}</span>
                    </div>
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tech_stack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-xs font-medium bg-gray-600 text-gray-200 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">No projects available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
            <p className="mt-1 text-sm text-gray-500">The project you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors duration-200"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12 transform transition-all duration-300 hover:shadow-xl">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {project.name}
                </h1>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 transition-colors duration-200 hover:bg-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {project.description}
                </p>
              </div>
              <div className="mt-6 sm:mt-0 sm:ml-6 flex flex-col sm:flex-row gap-4">
                {project.github_repo_url && (
                  <a
                    href={project.github_repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View on GitHub
                  </a>
                )}
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Assign Student
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed">{project.long_description || project.description}</p>
              </div>
            </div>

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-3">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 transition-all duration-200 hover:from-blue-100 hover:to-blue-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Stats */}
            {githubDetails && (
              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  GitHub Statistics
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-blue-600">{githubDetails.stargazers_count}</div>
                    <div className="text-sm text-blue-800 mt-2">Stars</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-blue-600">{githubDetails.forks_count}</div>
                    <div className="text-sm text-blue-800 mt-2">Forks</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-blue-600">{githubDetails.open_issues_count}</div>
                    <div className="text-sm text-blue-800 mt-2">Open Issues</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-blue-600">{githubDetails.watchers_count}</div>
                    <div className="text-sm text-blue-800 mt-2">Watchers</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Project Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Project Information
              </h2>
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'active' 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Difficulty</dt>
                  <dd className="mt-2 text-lg text-gray-900">{project.difficulty_level}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-2 text-lg text-gray-900">{project.priority}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Max Members</dt>
                  <dd className="mt-2 text-lg text-gray-900">{project.max_members}</dd>
                </div>
              </dl>
            </div>

            {/* Project Members */}
            <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Project Members
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                  {projectMembers.length} / {project.max_members}
                </span>
              </div>
              <div className="space-y-4">
                {projectMembers.map((member) => (
                  <ProjectMemberCard key={member.id} member={member} onRemove={handleRemoveMember} />
                ))}
                {projectMembers.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No members assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md border border-gray-700 shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-white">Assign Student</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoadingMembers}
                >
                  <option value="" className="text-gray-400 bg-gray-800">Select a student...</option>
                  {availableStudentsForAssignment.map((student) => (
                    <option key={student.id} value={student.id} className="text-white bg-gray-800">
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member" className="text-white bg-gray-800">Member</option>
                  <option value="lead" className="text-white bg-gray-800">Lead</option>
                  <option value="co-lead" className="text-white bg-gray-800">Co-Lead</option>
                  <option value="contributor" className="text-white bg-gray-800">Contributor</option>
                  <option value="mentor" className="text-white bg-gray-800">Mentor</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignStudent(selectedStudent)}
                  disabled={!selectedStudent}
                  className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
