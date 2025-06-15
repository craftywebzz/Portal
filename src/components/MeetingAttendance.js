"use client";

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSave } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MeetingAttendance({ meeting, onAttendanceUpdate }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchStudents();
      fetchAttendance();
    }
  }, [meeting.id, user, authLoading]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStudents(data);
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance?meeting_id=${meeting.id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch attendance');
      }
      
      const data = await response.json();
      
      // Convert attendance array to object for easier lookup
      const attendanceObj = {};
      data.forEach(record => {
        attendanceObj[record.user_id] = record.status;
      });
      setAttendance(attendanceObj);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    // Clear any previous messages
    setError(null);
    setSuccess(null);
  };

  const saveAttendance = async () => {
    if (!user) {
      setError('Please sign in to save attendance');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare attendance data
      const attendanceData = Object.entries(attendance).map(([user_id, status]) => ({
        user_id,
        status,
        meeting_id: meeting.id
      }));

      const response = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          meeting_id: meeting.id,
          attendance: attendanceData
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save attendance');
      
      setSuccess(`Successfully marked attendance for ${data.count} students`);
      
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-center text-gray-400">
          Please sign in to view and manage attendance
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Attendance List</h3>
        <button
          onClick={saveAttendance}
          disabled={saving || Object.keys(attendance).length === 0}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <FiSave className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              Save Attendance
            </>
          )}
        </button>
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

      <div className="space-y-2">
        {students.map(student => (
          <div
            key={student.id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                {student.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-white font-medium">{student.full_name}</p>
                <p className="text-gray-400 text-sm">{student.batch}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleAttendanceChange(student.id, 'present')}
                className={`px-3 py-1 rounded-lg flex items-center ${
                  attendance[student.id] === 'present'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <FiCheck className="mr-1" />
                Present
              </button>
              <button
                onClick={() => handleAttendanceChange(student.id, 'absent')}
                className={`px-3 py-1 rounded-lg flex items-center ${
                  attendance[student.id] === 'absent'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <FiX className="mr-1" />
                Absent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 