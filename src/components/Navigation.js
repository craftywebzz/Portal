"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiHome,
  FiUsers,
  FiCode,
  FiCalendar,
  FiAward,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiSettings,
  FiChevronDown,
  FiUserCheck
} from "react-icons/fi";

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dark mode initialization
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);
  
  // Toggle dark mode with smooth transition
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Navigation items with enhanced structure
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome, description: "Overview & Analytics" },
    { name: "Projects", href: "/projects", icon: FiCode, description: "Code & Repositories" },
    { name: "Students", href: "/students", icon: FiUsers, description: "Team Members" },
    { name: "Meetings", href: "/meetings", icon: FiCalendar, description: "Schedule & Events" },
  ];
  
  const adminNavItems = [
    { name: "New Project", href: "/projects/new", icon: FiCode, description: "Create Repository" },
    { name: "Schedule Meeting", href: "/meetings/new", icon: FiCalendar, description: "Book Session" },
    { name: "Mark Attendance", href: "/meetings/attendance", icon: FiCalendar, description: "Take Attendance" },
    { name: "Manage Users", href: "/admin/manage-users", icon: FiUsers, description: "User Management" },
    { name: "Make Admin", href: "/admin/make-admin", icon: FiUserCheck, description: "Grant Admin Access" },
    { name: "Settings", href: "/admin/settings", icon: FiSettings, description: "Admin Panel" },
  ];

  const isActiveRoute = (href) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };
  
  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200/50 dark:border-cyan-500/30 shadow-lg' 
          : 'backdrop-blur-lg bg-white/60 dark:bg-black/40 border-b border-gray-200/30 dark:border-cyan-500/20'
      }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 lg:h-18">
            
            {/* Logo Section - Enhanced */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center group">
                <div className="relative">
                  {/* Animated logo background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-110"></div>
                  
                  <div className="relative px-3 py-2 rounded-lg border border-transparent group-hover:border-cyan-500/30 transition-all duration-300">
                    <span className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-wider">
                      NST
                    </span>
                    <span className="text-lg lg:text-xl font-bold text-gray-600 dark:text-gray-400 ml-2">
                      DEV CLUB
                    </span>
                  </div>
                  
                  {/* Animated underline */}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation - Enhanced */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActiveRoute(item.href)
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                      : "text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100/80 dark:hover:bg-white/10"
                  }`}
                >
                  <item.icon className={`mr-2.5 h-4 w-4 transition-transform duration-300 ${
                    isActiveRoute(item.href) ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span>{item.name}</span>
                  
                  {/* Active indicator */}
                  {isActiveRoute(item.href) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                  
                  {/* Hover tooltip */}
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {item.description}
                  </div>
                </Link>
              ))}
            </nav>

            {/* Desktop Right Section - Enhanced */}
            <div className="hidden lg:flex items-center space-x-3">
              
              {/* Dark Mode Toggle - Enhanced */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-cyan-500/30 text-gray-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-cyan-500/10 hover:border-gray-300 dark:hover:border-cyan-400 transition-all duration-300 group"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <div className="relative w-4 h-4">
                  <FiSun className={`absolute inset-0 transition-all duration-300 ${darkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                  <FiMoon className={`absolute inset-0 transition-all duration-300 ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}`} />
                </div>
              </button>

              {/* User Profile Dropdown - Enhanced */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl border border-gray-200 dark:border-purple-500/30 hover:border-gray-300 dark:hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-purple-500/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 group"
                  >
                    <div className="relative">
                      <img
                        src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.user_metadata?.full_name || user.email}
                        className="h-8 w-8 rounded-full border-2 border-purple-500/50 group-hover:border-purple-500 transition-colors"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black"></div>
                    </div>
                    <div className="text-left max-w-32">
                      <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-green-500 font-medium uppercase tracking-wide">Online</div>
                    </div>
                    <FiChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-purple-500/30 shadow-2xl py-2 animate-in slide-in-from-top-2 duration-200">
                      
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-purple-500/20">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                            alt={user.user_metadata?.full_name || user.email}
                            className="h-12 w-12 rounded-full border-2 border-purple-500"
                          />
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-white">
                              {user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            <div className="text-xs text-green-500 font-medium uppercase tracking-wide mt-1">● Online</div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-2">
                        <Link
                          href={`/students/${user.id}`}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-cyan-500/10 transition-all duration-200 group"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <FiUser className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-medium">My Profile</div>
                            <div className="text-xs text-gray-500">View and edit profile</div>
                          </div>
                        </Link>
                      </div>

                      {/* Admin Section */}
                      {user.email && (
                        <>
                          <div className="px-4 py-2 border-t border-gray-200 dark:border-purple-500/20">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Admin Tools</div>
                          </div>
                          <div className="py-1">
                            {adminNavItems.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-purple-500/10 transition-all duration-200 group"
                                onClick={() => setUserDropdownOpen(false)}
                              >
                                <item.icon className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-gray-500">{item.description}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Sign Out */}
                      <div className="border-t border-red-500/20 mt-2">
                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 group"
                          onClick={() => {
                            signOut();
                            setUserDropdownOpen(false);
                          }}
                        >
                          <FiLogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-medium">Sign Out</div>
                            <div className="text-xs text-gray-500">Disconnect from session</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  Connect
                </Link>
              )}
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Mobile dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-cyan-500/10 transition-all duration-300"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <div className="relative w-4 h-4">
                  <FiSun className={`absolute inset-0 transition-all duration-300 ${darkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                  <FiMoon className={`absolute inset-0 transition-all duration-300 ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}`} />
                </div>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-cyan-500/30 text-gray-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-cyan-500/10 hover:border-gray-300 dark:hover:border-cyan-400 transition-all duration-300 focus:outline-none"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <div className="relative w-5 h-5">
                  <FiMenu className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                  <FiX className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-200 dark:border-cyan-500/30 bg-white/95 dark:bg-black/95 backdrop-blur-xl">
            
            {/* Mobile Navigation Links */}
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Mobile Admin Section */}
            {user?.email && (
              <>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin Tools
                  </p>
                </div>
                <div className="px-4 pb-3 space-y-1">
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
            
            {/* Mobile User Section */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                      alt={user.user_metadata?.full_name || user.email}
                      className="h-12 w-12 rounded-full border-2 border-purple-500"
                    />
                    <div>
                      <div className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      <div className="text-xs text-green-500 font-medium uppercase tracking-wide">● Online</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link
                      href={`/students/${user.id}`}
                      className="flex items-center px-3 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
                    >
                      <FiUser className="mr-3 h-5 w-5" />
                      My Profile
                    </Link>
                    <button
                      className="flex w-full items-center px-3 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                      onClick={() => signOut()}
                    >
                      <FiLogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/"
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-base font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Connect
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-0"></div>
    </>
  );
}