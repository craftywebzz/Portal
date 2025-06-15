"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { meetingsService } from "@/lib/services/meetings";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiExternalLink,
  FiVideo,
  FiCheckCircle,
  FiX,
  FiSearch,
  FiFilter,
  FiClipboard,
  FiAlertCircle
} from "react-icons/fi";
import AttendanceTracker from '@/components/AttendanceTracker';
import MeetingAttendance from '@/components/MeetingAttendance';

export default function MeetingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("list");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    link: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMarking, setIsMarking] = useState(false);

  // Check if user is admin
  const isAdmin = user?.is_admin || false;

  // Fetch meetings on component mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await meetingsService.getAllMeetings();
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMessage({ type: "error", text: "Failed to load meetings" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Check if user is authenticated
    if (!user) {
      setMessage({ type: "error", text: "You must be logged in to schedule a meeting." });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          created_by: user.id,
          recipients: ["member@example.com"] // TODO recipients list
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage({ type: "success", text: "Meeting scheduled successfully!" });
      setForm({ title: "", date: "", time: "", location: "", link: "", description: "" });

      // Refresh meetings list and switch to list tab
      await fetchMeetings();
      setActiveTab("list");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcoming = (date, time) => {
    const meetingDateTime = new Date(`${date}T${time}`);
    return meetingDateTime > new Date();
  };

  const upcomingMeetings = meetings.filter(meeting =>
    isUpcoming(meeting.date, meeting.startTime)
  );

  const pastMeetings = meetings.filter(meeting =>
    !isUpcoming(meeting.date, meeting.startTime)
  );

  const handleMarkAttendance = async () => {
    setIsMarking(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/meetings/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceCode,
          userId: user.id
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess("Attendance marked successfully!");
      setAttendanceCode("");
      fetchMeetings();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meetings</h1>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <button
                onClick={() => setActiveTab("create")}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiCalendar className="mr-2" />
                Schedule Meeting
              </button>
            )}
            
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <FiCheckCircle className="mr-2" />
              Mark Attendance
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "list"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "upcoming"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Upcoming ({upcomingMeetings.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "past"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Past ({pastMeetings.length})
          </button>
        </div>
        {(activeTab === "list" || activeTab === "upcoming" || activeTab === "past") && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading meetings...</p>
              </div>
            ) : (
              <div>
                {(() => {
                  let displayMeetings = meetings;
                  if (activeTab === "upcoming") displayMeetings = upcomingMeetings;
                  if (activeTab === "past") displayMeetings = pastMeetings;

                  if (displayMeetings.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No meetings found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {activeTab === "upcoming" && "No upcoming meetings scheduled."}
                          {activeTab === "past" && "No past meetings found."}
                          {activeTab === "list" && "No meetings have been created yet."}
                        </p>
                        {activeTab === "create" && isAdmin && (
                          <button
                            onClick={() => setActiveTab("create")}
                            className="btn-primary"
                          >
                            Schedule Your First Meeting
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-4">
                      {displayMeetings.map((meeting) => (
                        <div key={meeting.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-2xl font-bold text-white mb-2">{meeting.title}</h2>
                              <p className="text-gray-400">{meeting.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              {meeting.meeting_link && (
                                <a
                                  href={meeting.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                  <FiVideo className="mr-2" />
                                  Join Meeting
                                </a>
                              )}
                              <Link
                                href={`/meetings/${meeting.id}/attendance`}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                <FiClipboard className="mr-2" />
                                Mark Attendance
                              </Link>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-700 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-white mb-2">Meeting Details</h3>
                              <div className="space-y-2">
                                <p className="text-gray-300">
                                  <span className="text-gray-400">Date:</span> {formatDate(meeting.date)}
                                </p>
                                <p className="text-gray-300">
                                  <span className="text-gray-400">Time:</span> {meeting.start_time} - {meeting.end_time}
                                </p>
                                <p className="text-gray-300">
                                  <span className="text-gray-400">Location:</span> {meeting.location}
                                </p>
                                <p className="text-gray-300">
                                  <span className="text-gray-400">Type:</span> {meeting.meeting_type}
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-700 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-white mb-2">Attendance Status</h3>
                              <div className="space-y-2">
                                <p className="text-gray-300">
                                  <span className="text-gray-400">Status:</span>{' '}
                                  <span className={`px-2 py-1 rounded-full text-sm ${
                                    meeting.attendance_open
                                      ? 'bg-green-900/50 text-green-300'
                                      : 'bg-red-900/50 text-red-300'
                                  }`}>
                                    {meeting.attendance_open ? 'Open' : 'Closed'}
                                  </span>
                                </p>
                                {meeting.attendance_open && meeting.attendance_code && (
                                  <p className="text-gray-300">
                                    <span className="text-gray-400">Code:</span>{' '}
                                    <span className="font-mono bg-gray-800 px-2 py-1 rounded">
                                      {meeting.attendance_code}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <MeetingAttendance 
                            meeting={meeting} 
                            onAttendanceUpdate={() => {
                              // Refresh meetings list after attendance update
                              fetchMeetings();
                            }} 
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && isAdmin && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Schedule a New Meeting</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-sm font-medium">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Location (Room or Online)</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">Online Link (optional)</label>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 py-2"
                >
                  {submitting ? "Scheduling..." : "Schedule Meeting"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "create" && !isAdmin && (
          <div className="text-center py-12">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Only administrators can schedule meetings.
            </p>
          </div>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Mark Attendance</h2>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="attendanceCode" className="block text-sm text-gray-400 mb-2">
                  Enter Attendance Code
                </label>
                <input
                  type="text"
                  id="attendanceCode"
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
                  onClick={() => setShowAttendanceModal(false)}
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
      </div>
    </>
  );
}
