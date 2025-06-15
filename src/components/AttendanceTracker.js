"use client";

import { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiUsers, FiPercent } from 'react-icons/fi';

export default function AttendanceTracker({ meeting, userId, onAttendanceMarked }) {
  const [isMarking, setIsMarking] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [error, setError] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    percentage: 0
  });

  useEffect(() => {
    fetchAttendanceStats();
  }, [meeting.id]);

  const fetchAttendanceStats = async () => {
    try {
      const response = await fetch(`/api/attendance?meeting_id=${meeting.id}`);
      const data = await response.json();
      
      if (data.success) {
        const total = data.data.length;
        const present = data.data.filter(a => a.status === 'present').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        setAttendanceStats({ total, present, percentage });
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const handleMarkAttendance = async () => {
    if (!meeting.attendanceOpen) {
      setError('Attendance is not open for this meeting');
      return;
    }

    setIsMarking(true);
    setError(null);

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meeting.id,
          attendance_code: attendanceCode,
          status: 'present'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark attendance');
      }

      // Refresh attendance stats
      await fetchAttendanceStats();
      
      // Notify parent component
      if (onAttendanceMarked) {
        onAttendanceMarked(data.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Attendance Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Invited</span>
            <FiUsers className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{attendanceStats.total}</div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Present</span>
            <FiCheckCircle className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{attendanceStats.present}</div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Attendance Rate</span>
            <FiPercent className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{attendanceStats.percentage}%</div>
        </div>
      </div>

      {/* Mark Attendance Section */}
      {meeting.attendanceOpen && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Mark Attendance</h3>
          
          {meeting.attendanceCode && (
            <div className="mb-4">
              <label htmlFor="attendanceCode" className="block text-sm text-gray-400 mb-2">
                Attendance Code
              </label>
              <input
                type="text"
                id="attendanceCode"
                value={attendanceCode}
                onChange={(e) => setAttendanceCode(e.target.value)}
                placeholder="Enter attendance code"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleMarkAttendance}
            disabled={isMarking || (meeting.attendanceCode && !attendanceCode)}
            className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
    </div>
  );
} 