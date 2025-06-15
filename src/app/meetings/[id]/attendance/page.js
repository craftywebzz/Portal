import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import MeetingAttendance from '@/components/MeetingAttendance';

export default async function MeetingAttendancePage({ params }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch meeting details
  const { data: meeting } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!meeting) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{meeting.title}</h1>
          <p className="text-gray-400">{meeting.description}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Meeting Details</h3>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="text-gray-400">Date:</span> {new Date(meeting.date).toLocaleDateString()}
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
              // Refresh the page to show updated attendance
              window.location.reload();
            }}
          />
        </div>
      </div>
    </div>
  );
} 