"use client";

import { FiTool, FiClock, FiRefreshCw } from "react-icons/fi";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-900/50 mb-6">
            <FiTool className="w-10 h-10 text-blue-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            System Maintenance
          </h1>
          
          <p className="text-gray-300 text-lg mb-8">
            We're currently performing scheduled maintenance to improve your experience.
            The system will be back online shortly.
          </p>

          <div className="bg-gray-700/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-4 text-gray-300 mb-4">
              <FiClock className="w-5 h-5" />
              <span>Estimated completion time: 30 minutes</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-gray-300">
              <FiRefreshCw className="w-5 h-5 animate-spin" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">What's happening?</h2>
            <ul className="text-left space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3"></span>
                <span>Database optimization and performance improvements</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3"></span>
                <span>Security updates and patches</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3"></span>
                <span>New feature deployment</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            <p>Need help? Contact support at support@nstdevclub.com</p>
          </div>
        </div>
      </div>
    </div>
  );
} 