"use client";

import { useState } from 'react';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

export default function AttendanceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleMarkAttendance = async () => {
    if (!attendanceCode) {
      setError('Please enter an attendance code');
      return;
    }

    setIsMarking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/attendance/quick-mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendance_code: attendanceCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark attendance');
      }

      setSuccess('Attendance marked successfully!');
      setAttendanceCode('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300"
      >
        <FiCheckCircle className="mr-2" />
        Mark Attendance
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Mark Attendance</h2>
            
            <div className="mb-4">
              <label htmlFor="quickAttendanceCode" className="block text-sm text-gray-400 mb-2">
                Enter Attendance Code
              </label>
              <input
                type="text"
                id="quickAttendanceCode"
                value={attendanceCode}
                onChange={(e) => setAttendanceCode(e.target.value)}
                placeholder="Enter the attendance code"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm">
                {success}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                disabled={isMarking || !attendanceCode}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMarking ? (
                  <>
                    <FiClock className="animate-spin mr-2" />
                    Marking...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mr-2" />
                    Mark Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 