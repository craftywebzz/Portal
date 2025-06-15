import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get all students (users with role 'student')
    const { data: students, error } = await supabase
      .from('profiles')
      .select('id, full_name, batch, avatar_url')
      .eq('role', 'student')
      .order('full_name');

    if (error) throw error;

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
} 