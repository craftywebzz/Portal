"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FiCalendar, FiCheck, FiX, FiAlertCircle, FiClock } from 'react-icons/fi';

export default function MarkAttendance() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      if (!user) {
        router.push('/');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        router.push('/dashboard');
      }
    };

    checkAdmin();
    fetchMeetings();
  }, [user, router]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (err) {
      setError('Failed to fetch meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceCode = async (meetingId) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const { data, error } = await supabase
        .from('meetings')
        .update({ 
          attendance_open: true,
          attendance_code: Math.random().toString(36).substring(2, 8).toUpperCase()
        })
        .eq('id', meetingId)
        .select()
        .single();

      if (error) throw error;

      setSelectedMeeting(data);
      setAttendanceCode(data.attendance_code);
      setSuccess(true);
    } catch (err) {
      setError('Failed to generate attendance code');
      console.error('Error generating code:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const closeAttendance = async (meetingId) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const { error } = await supabase
        .from('meetings')
        .update({ 
          attendance_open: false,
          attendance_code: null
        })
        .eq('id', meetingId);

      if (error) throw error;

      setSelectedMeeting(null);
      setAttendanceCode('');
      setSuccess(true);
      fetchMeetings();
    } catch (err) {
      setError('Failed to close attendance');
      console.error('Error closing attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mark Attendance</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
            <FiAlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
            <FiCheck className="h-5 w-5" />
            <span>Operation completed successfully!</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <FiCalendar className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {meeting.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.start_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {meeting.attendance_open ? (
                      <>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          Code: {meeting.attendance_code}
                        </div>
                        <button
                          onClick={() => closeAttendance(meeting.id)}
                          disabled={submitting}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <FiX className="h-4 w-4" />
                          <span>Close</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => generateAttendanceCode(meeting.id)}
                        disabled={submitting}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <FiClock className="h-4 w-4" />
                        <span>Open Attendance</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 