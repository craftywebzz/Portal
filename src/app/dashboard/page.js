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
  FiBarChart
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
      router.push("/auth/signin");
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
                    {/* <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Rank</div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">#1</div>
                    </div> */}
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
                    {/* <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Status</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">Active</div>
                    </div> */}
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
                    {/* <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">This Week</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">2</div>
                    </div> */}
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
                    {/* <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Growth</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">+12%</div>
                    </div> */}
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
                  <div key={project.id} className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 transform hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-4">
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
                <div className="col-span-full">
                  <div className="text-center py-16 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FiCode className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Projects Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      You're not part of any projects yet. Start by creating your first project or joining an existing one.
                    </p>
                    <Link href="/projects/new" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300">
                      <FiZap className="mr-2 h-5 w-5" />
                      Create New Project
                    </Link>
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
                <FiArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform " />
                {/* Enhanced Upcoming Meetings Section - Continued */}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {meetings.length > 0 ? (
                meetings.map((meeting, index) => (
                  <div key={meeting.id} className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:border-green-500/50 dark:hover:border-green-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 transform hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{meeting.title}</h3>
                            {meeting.attendanceOpen && (
                              <span className="flex items-center text-xs px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 rounded-full font-medium border border-green-500/30">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                Attendance Open
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-md mr-2">
                                <FiCalendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-medium">{formatDate(meeting.date)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-md mr-2">
                                <FiClock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              </div>
                              <span>{meeting.time}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded-md mr-2">
                                <FiMapPin className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                              </div>
                              <span>{meeting.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <Link 
                          href={`/meetings#meeting-${meeting.id}`} 
                          className="group/link flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-medium transition-colors"
                        >
                          View details 
                          <FiArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                        
                        {meeting.attendanceOpen && (
                          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
                            <FiCheckCircle className="mr-1 h-4 w-4" />
                            Mark Attendance
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-16 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FiCalendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Upcoming Meetings</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      No meetings are currently scheduled. Check back later or schedule a new meeting to get started.
                    </p>
                    {user?.email && (
                      <Link href="/meetings/new" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
                        <FiZap className="mr-2 h-5 w-5" />
                        Schedule Meeting
                      </Link>
                    )}
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
                <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50" role="list">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="group p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors duration-200" role="listitem">
                      <div className="flex items-start space-x-4">
                        <div className={`relative p-3 rounded-2xl shadow-sm ${
                          activity.type === 'project_contribution' 
                            ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400' 
                            : activity.type === 'meeting_attendance'
                              ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400'
                              : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400'
                        } group-hover:scale-110 transition-transform duration-200`}>
                          {activity.type === 'project_contribution' && <FiCode size={20} />}
                          {activity.type === 'meeting_attendance' && <FiCalendar size={20} />}
                          {activity.type === 'issue_solved' && <FiCheckCircle size={20} />}
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-base">
                                {activity.action}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {activity.type === 'project_contribution' && (
                                  <span className="flex items-center">
                                    <FiTarget className="mr-1 h-3 w-3" />
                                    Project: <span className="font-medium ml-1">{activity.project}</span>
                                  </span>
                                )}
                                {activity.type === 'meeting_attendance' && (
                                  <span className="flex items-center">
                                    <FiUsers className="mr-1 h-3 w-3" />
                                    Meeting: <span className="font-medium ml-1">{activity.meeting}</span>
                                  </span>
                                )}
                                {activity.type === 'issue_solved' && (
                                  <span className="flex items-center">
                                    <FiStar className="mr-1 h-3 w-3" />
                                    Project: <span className="font-medium ml-1">{activity.project}</span>
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center mt-2 space-x-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                  {formatDate(activity.date)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  2 hours ago
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <div className="flex items-center px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 rounded-full">
                                <FiZap className="mr-1 h-3 w-3" />
                                <span className="text-sm font-bold">+{activity.points}</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">points</span>
                            </div>
                          </div>
                        </div>
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
          
          {/* Enhanced Quick Actions - Only shown to authenticated users */}
          {user?.email && (
            <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  Quick Actions
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Jump into the most common tasks with one click
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/projects/new" className="group relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <FiCode size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">New Project</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Start a new coding project</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/meetings/new" className="group relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <FiCalendar size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Schedule Meeting</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Plan team sessions</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/students" className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <FiUsers size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">View Members</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Connect with teammates</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/projects" className="group relative bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <FiGithub size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">All Projects</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Browse all projects</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}