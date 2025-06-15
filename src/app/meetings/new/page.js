"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient"; // Import your Supabase client
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUsers, 
  FiSave, 
  FiArrowLeft,
  FiAlertCircle,
  FiCheck,
  FiX
} from "react-icons/fi";


export default function NewMeeting() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check if user is admin
  const isAdmin = user?.is_admin || false;

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.push('/meetings');
    }
  }, [isAdmin, router]);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    location: "",
    description: "",
    attendees: [],
    meeting_link: "",
    openAttendanceImmediately: false
  });

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("profiles") // Replace with your actual table name
        .select("*"); // Fetch all columns

      if (error) {
        console.error("Error fetching students:", error);
      } else {
        setStudents(data);
      }
    };

    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const toggleBatchFilter = (batch) => {
    setSelectedBatches(prev => {
      if (prev.includes(batch)) {
        return prev.filter(b => b !== batch);
      } else {
        return [...prev, batch];
      }
    });
  };

  const toggleAttendee = (studentId) => {
    setFormData(prev => {
      if (prev.attendees.includes(studentId)) {
        return {
          ...prev,
          attendees: prev.attendees.filter(id => id !== studentId)
        };
      } else {
        return {
          ...prev,
          attendees: [...prev.attendees, studentId]
        };
      }
    });
  };

  const selectAllStudents = () => {
    const filteredStudentIds = filteredStudents.map(student => student.id);
    setFormData(prev => ({
      ...prev,
      attendees: [...new Set([...prev.attendees, ...filteredStudentIds])]
    }));
  };

  const deselectAllStudents = () => {
    const filteredStudentIds = new Set(filteredStudents.map(student => student.id));
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(id => !filteredStudentIds.has(id))
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Meeting title is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }
    
    if (!formData.time) {
      newErrors.time = "Time is required";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (formData.attendees.length === 0) {
      newErrors.attendees = "At least one attendee must be selected";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setFormSubmitted(true);

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          attendees: formData.attendees.map(id => {
            const student = students.find(s => s.id === id);
            return student?.email;
          }).filter(Boolean)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting');
      }

      router.push('/meetings');
    } catch (error) {
      console.error('Error creating meeting:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique batches for filtering
  const uniqueBatches = [...new Set(students.map(student => student.batch))].sort();
  
  // Filter students based on search query and selected batches
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = selectedBatches.length === 0 || selectedBatches.includes(student.batch);
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {!isAdmin ? (
        <div className="text-center py-12">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can schedule meetings.
          </p>
          <Link href="/meetings" className="mt-4 inline-flex items-center text-primary hover:underline">
            <FiArrowLeft className="mr-2" /> Back to Meetings
          </Link>
        </div>
      ) : (
        <>
          <Link href="/meetings" className="inline-flex items-center text-primary hover:underline mb-6">
            <FiArrowLeft className="mr-2" /> Back to Meetings
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Schedule New Meeting</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new team meeting and invite attendees
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-4xl">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
                <div className="flex items-center">
                  <FiAlertCircle className="mr-2" />
                  <span>{errors.submit}</span>
                </div>
              </div>
            )}
            
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Meeting Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meeting Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors.title ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
                    } bg-white dark:bg-gray-800`}
                    placeholder="e.g., Weekly Project Update"
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiCalendar className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                        errors.date ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
                      } bg-white dark:bg-gray-800`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiClock className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                        errors.time ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
                      } bg-white dark:bg-gray-800`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800"
                    disabled={isLoading}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>
                
                <div className="col-span-full">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiMapPin className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                        errors.location ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-gray-700"
                      } bg-white dark:bg-gray-800`}
                      placeholder="e.g., Room 302 or Zoom (include link in description)"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
                  )}
                </div>
                
                <div className="col-span-full">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800"
                    placeholder="Provide details about the meeting agenda, requirements, etc."
                    disabled={isLoading}
                  />
                </div>
                
                <div className="col-span-full">
                  <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meeting Link (optional)
                  </label>
                  <input
                    type="url"
                    id="meeting_link"
                    name="meeting_link"
                    value={formData.meeting_link}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800"
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Add a Google Meet, Zoom, or other video conferencing link
                  </p>
                </div>
                
                <div className="col-span-full">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="openAttendanceImmediately"
                      name="openAttendanceImmediately"
                      checked={formData.openAttendanceImmediately}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <label htmlFor="openAttendanceImmediately" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Open attendance immediately after creation
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    If unchecked, you'll need to manually open attendance later
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Select Attendees*</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.attendees.length} selected
                </div>
              </div>
              
              {errors.attendees && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-sm">
                  <div className="flex items-center">
                    <FiAlertCircle className="mr-2" />
                    <span>{errors.attendees}</span>
                  </div>
                </div>
              )}
              
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attendees
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllStudents}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Deselect All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <input
                          type="checkbox"
                          id={`student-${student.id}`}
                          checked={formData.attendees.includes(student.id)}
                          onChange={() => toggleAttendee(student.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`student-${student.id}`}
                          className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          {student.full_name}
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {student.email}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {errors.attendees && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.attendees}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Link
                href="/meetings"
                className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                aria-disabled={isLoading}
                tabIndex={isLoading ? -1 : undefined}
                onClick={(e) => isLoading && e.preventDefault()}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Meeting...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Schedule Meeting
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
