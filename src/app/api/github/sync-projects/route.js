import { NextResponse } from 'next/server';
import { GitHubProjectsService } from '@/lib/services/github-projects';
import { ProjectsService } from '@/lib/services/projects';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { forceRefresh = false } = body;

    // Initialize services
    const githubProjectsService = new GitHubProjectsService();
    const projectsService = new ProjectsService();

    // Fetch projects from GitHub organization
    const githubProjects = await githubProjectsService.fetchOrganizationRepositories();

    // Get existing projects from Supabase
    const { data: existingProjects, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id, github_repo_url');

    if (fetchError) {
      throw new Error(`Failed to fetch existing projects: ${fetchError.message}`);
    }

    // Create a map of existing projects by GitHub URL
    const existingProjectsMap = new Map(
      existingProjects.map(project => [project.github_repo_url, project])
    );

    // Process each GitHub project
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const githubProject of githubProjects) {
      try {
        const projectData = {
          name: githubProject.name,
          description: githubProject.description || '',
          long_description: githubProject.description || '',
          tech_stack: githubProject.techStack || [],
          status: githubProject.status === 'archived' ? 'archived' : 'active',
          github_repo_url: githubProject.repoUrl,
          github_stars: githubProject.stars,
          github_forks: githubProject.forks,
          is_public: true,
          difficulty_level: 'intermediate',
          priority: 'medium',
          max_members: 5
        };

        const existingProject = existingProjectsMap.get(githubProject.repoUrl);

        if (existingProject) {
          // Update existing project
          const { error: updateError } = await supabaseAdmin
            .from('projects')
            .update(projectData)
            .eq('id', existingProject.id);

          if (updateError) {
            throw new Error(`Failed to update project: ${updateError.message}`);
          }
          results.updated++;
        } else {
          // Create new project
          const { error: insertError } = await supabaseAdmin
            .from('projects')
            .insert([projectData]);

          if (insertError) {
            throw new Error(`Failed to create project: ${insertError.message}`);
          }
          results.created++;
        }
      } catch (error) {
        console.error(`Error processing project ${githubProject.name}:`, error);
        results.errors.push({
          project: githubProject.name,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'GitHub projects synced successfully'
    });

  } catch (error) {
    console.error('Error syncing GitHub projects:', error);

    return NextResponse.json(
      {
        error: 'Failed to sync GitHub projects',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to sync GitHub projects',
    example: {
      method: 'POST',
      body: {
        forceRefresh: false
      }
    }
  });
} 