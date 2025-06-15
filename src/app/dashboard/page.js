"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import {
  FiUsers,
  FiCode,
  FiAward,
  FiCalendar,
  FiGithub,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiMapPin,
  FiRefreshCw,
  FiTrendingUp,
  FiActivity,
  FiZap,
  FiStar,
  FiTarget,
  FiBarChart,
  FiPlus,
  FiBookmark,
  FiMessageSquare,
  FiBell
} from "react-icons/fi";
import { dashboardService } from '@/lib/services/dashboard';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Fetch dashboard data from Supabase
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardData = await dashboardService.getDashboardStats(user.id);

      setStats({
        totalStudents: dashboardData.totalStudents,
        totalProjects: dashboardData.totalProjects,
        activeProjects: dashboardData.activeProjects,
        upcomingMeetings: dashboardData.upcomingMeetings,
        myProjects: dashboardData.myProjects,
        myRewardPoints: dashboardData.myRewardPoints,
        recentAttendance: dashboardData.recentAttendance
      });

      setProjects(dashboardData.projects);
      setMeetings(dashboardData.meetings);
      setRecentActivity(dashboardData.activity);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    try {
      setIsRefreshing(true);
      await fetchDashboardData();
    } catch (err) {
      console.error("Error refreshing dashboard:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Check if user is admin
  const isAdmin = user?.is_admin || false;

  // Enhanced loading state with modern skeleton
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
        <div className="container mx-auto py-8 px-4 lg:px-6">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="space-y-3">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl w-80"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-64"></div>
              </div>
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl w-40"></div>
            </div>
            
            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-24"></div>
                    <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full"></div>
                  </div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-16"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-20"></div>
                </div>
              ))}
            </div>
            
            {/* Content sections skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-48"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 space-y-4">
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-32"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-24"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
        <div className="container mx-auto py-8 px-4 lg:px-6">
          {/* Enhanced Header Section */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                  Live Dashboard
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent leading-tight">
                Welcome back,
              </h1>
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                Here's what's happening in the NST Dev Club ecosystem
              </p>
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <FiAlertCircle className="text-red-500 h-5 w-5" />
                    <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                aria-label="Refresh dashboard data"
                onClick={refreshDashboard}
                disabled={isRefreshing}
                className="group relative flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <FiRefreshCw className={`mr-2 h-5 w-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </div>
              </button>
            </div>
          </div>
          
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* My Reward Points Card */}
            <div className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-purple-500/30 p-6 hover:border-purple-500/50 dark:hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">My Reward Points</h3>
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FiAward size={20} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{stats?.myRewardPoints || 0}</p>
                      <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                        <FiTrendingUp className="mr-1 h-4 w-4" />
                        <span>Recent: {stats?.recentAttendance || 0}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/students/${user?.id}`} className="group/link flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium transition-colors">
                    View breakdown 
                    <FiArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* My Projects Card */}
            <div className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-cyan-500/30 p-6 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">My Projects</h3>
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FiCode size={20} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{stats?.myProjects || 0}</p>
                      <div className="flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400">
                        <FiActivity className="mr-1 h-4 w-4" />
                        <span>{stats?.activeProjects || 0} active total</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/projects?myProjects=true" className="group/link flex items-center text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-medium transition-colors">
                    View my projects 
                    <FiArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Upcoming Meetings Card */}
            <div className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-green-500/30 p-6 hover:border-green-500/50 dark:hover:border-green-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">Upcoming Meetings</h3>
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FiCalendar size={20} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{stats?.upcomingMeetings || 0}</p>
                      <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
                        <FiClock className="mr-1 h-4 w-4" />
                        <span>Next: {meetings[0]?.date ? formatDate(meetings[0]?.date) : "None"}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/meetings" className="group/link flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-medium transition-colors">
                    View schedule 
                    <FiArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Club Members Card */}
            <div className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-orange-500/30 p-6 hover:border-orange-500/50 dark:hover:border-orange-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">Club Members</h3>
                  <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FiUsers size={20} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{stats?.totalStudents || 0}</p>
                      <div className="flex items-center mt-2 text-sm text-purple-600 dark:text-purple-400">
                        <FiBarChart className="mr-1 h-4 w-4" />
                        <span>{stats?.totalProjects || 0} total projects</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/students" className="group/link flex items-center text-sm text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 font-medium transition-colors">
                    View all members 
                    <FiArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced My Projects Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  My Projects
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Track your active contributions and progress</p>
              </div>
              <Link href="/projects?myProjects=true" className="group flex items-center px-4 py-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-semibold transition-colors">
                View all 
                <FiArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <div key={project.id} className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 transform hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{project.name}</h3>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span className="font-medium">Role:</span> {project.role}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              project.status === 'Active' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            }`}>
                              {project.status}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Last updated 2 days ago
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {project.progress}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                          </div>
                          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <FiGithub className="mr-1 h-3 w-3" />
                            <span>12 commits</span>
                          </div>
                          <div className="flex items-center">
                            <FiUsers className="mr-1 h-3 w-3" />
                            <span>3 members</span>
                          </div>
                        </div>
                        <Link 
                          href={`/projects/${project.id}`} 
                          className="group/link flex items-center text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-medium transition-colors"
                        >
                          View details 
                          <FiArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2">
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FiCode className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Projects Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Start contributing to projects or create a new one to see your progress here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Upcoming Meetings Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Upcoming Meetings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Stay connected with your team sessions</p>
              </div>
              <Link href="/meetings" className="group flex items-center px-4 py-2 text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-semibold transition-colors">
                View all 
                <FiArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <div key={meeting.id} className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 transform hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{meeting.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <FiCalendar className="mr-1 h-4 w-4" />
                              <span>{formatDate(meeting.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <FiClock className="mr-1 h-4 w-4" />
                              <span>{meeting.start_time} - {meeting.end_time}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.meeting_type === 'general' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            : meeting.meeting_type === 'project'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {(meeting.meeting_type || 'general').charAt(0).toUpperCase() + (meeting.meeting_type || 'general').slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {meeting.description || 'No description available'}
                      </p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <FiMapPin className="mr-1 h-3 w-3" />
                            <span>{meeting.location}</span>
                          </div>
                          <div className="flex items-center">
                            <FiUsers className="mr-1 h-3 w-3" />
                            <span>{meeting.max_attendees || 'Unlimited'} spots</span>
                          </div>
                        </div>
                        <Link 
                          href={`/meetings/${meeting.id}`} 
                          className="group/link flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-medium transition-colors"
                        >
                          View details 
                          <FiArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2">
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FiCalendar className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Upcoming Meetings</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      There are no scheduled meetings at the moment. Check back later for updates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Recent Activity Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Recent Activity
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Your latest contributions and achievements</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Live updates</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${
                          activity.type === 'commit' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : activity.type === 'pr'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : activity.type === 'meeting'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                        }`}>
                          {activity.type === 'commit' && <FiCode size={20} />}
                          {activity.type === 'pr' && <FiGitBranch size={20} />}
                          {activity.type === 'meeting' && <FiCalendar size={20} />}
                          {activity.type === 'reward' && <FiAward size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{activity.time}</span>
                            {activity.project && (
                              <Link 
                                href={`/projects/${activity.project.id}`}
                                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300"
                              >
                                {activity.project.name}
                              </Link>
                            )}
                          </div>
                        </div>
                        {activity.points && (
                          <div className="flex items-center space-x-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                            <FiAward className="h-4 w-4" />
                            <span>+{activity.points}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiActivity className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Recent Activity</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Start contributing to projects or attending meetings to see your activity here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}