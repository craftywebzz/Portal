import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export class ProjectsService {
  constructor() {
    this.supabase = supabase;
  }

  // Fetch all projects
  async getAllProjects(filters = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.search) {
        params.append('search', filters.search);
      }

      if (filters.userId) {
        params.append('userId', filters.userId);
      }

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.techStack && filters.techStack.length > 0) {
        params.append('techStack', filters.techStack[0]);
      }

      // Make API call
      const response = await fetch(`/api/projects?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch projects');
      }

      // Transform the data to match expected format
      const transformedProjects = result.data.map(project => {
        const transformed = this.transformProjectData(project, filters.userId);
        return transformed;
      });

      return transformedProjects;

    } catch (error) {
      throw error;
    }
  }

  // Fetch single project by ID
  async getProjectById(id) {
    try {
      // Check if ID is numeric
      if (!isNaN(id)) {
        const { data: projects, error } = await this.supabase
          .from('projects')
          .select(`
            *,
            created_by_user:profiles!projects_created_by_fkey(
              id,
              full_name,
              avatar_url,
              github_username
            ),
            project_members(
              id,
              role,
              is_active,
              user_id,
              joined_at,
              user:profiles(
                id,
                full_name,
                avatar_url,
                github_username
              )
            )
          `)
          .eq('numeric_id', id);

        if (error) {
          throw new Error(`Error fetching project: ${error.message}`);
        }

        if (!projects || projects.length === 0) {
          throw new Error(`Project not found with numeric ID: ${id}`);
        }

        return projects[0];
      }

      // If ID is not numeric, validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error(`Invalid project ID format. Expected a numeric ID or UUID, got: ${id}`);
      }

      // Search by UUID
      const { data: projects, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          created_by_user:profiles!projects_created_by_fkey(
            id,
            full_name,
            avatar_url,
            github_username
          ),
          project_members(
            id,
            role,
            is_active,
            user_id,
            joined_at,
            user:profiles(
              id,
              full_name,
              avatar_url,
              github_username
            )
          )
        `)
        .eq('id', id);

      if (error) {
        throw new Error(`Error fetching project: ${error.message}`);
      }

      if (!projects || projects.length === 0) {
        throw new Error(`Project not found with UUID: ${id}`);
      }

      return projects[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new project
  async createProject(projectData, userId) {
    try {


      // Use the proper API route with service role key
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          created_by: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }


      return this.transformProjectData(result.data);

    } catch (error) {
      throw error;
    }
  }

  // Update project
  async updateProject(id, updates, userId) {
    try {
      // Check if user has permission to update
      const { data: project } = await this.supabase
        .from('projects')
        .select('created_by')
        .eq('id', id)
        .single();

      if (!project || project.created_by !== userId) {
        throw new Error('Unauthorized to update this project');
      }

      const { data: updatedProject, error } = await this.supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return this.transformProjectData(updatedProject);

    } catch (error) {
      throw error;
    }
  }

  // Join project
  async joinProject(projectId, userId, role = 'member') {
    try {
      // Check if project exists and has space
      const { data: project } = await this.supabase
        .from('projects')
        .select('max_members, project_members(count)')
        .eq('id', projectId)
        .single();

      if (!project) {
        throw new Error('Project not found');
      }

      const currentMembers = project.project_members?.[0]?.count || 0;
      if (currentMembers >= project.max_members) {
        throw new Error('Project is full');
      }

      // Add user to project
      const { data: membership, error } = await this.supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: role
        })
        .select(`
          *,
          user:profiles(id, full_name, avatar_url),
          project:projects(id, name)
        `)
        .single();

      if (error) {
        throw error;
      }

      return membership;

    } catch (error) {
      throw error;
    }
  }

  // Leave project
  async leaveProject(projectId, userId) {
    try {
      const { error } = await this.supabase
        .from('project_members')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { success: true };

    } catch (error) {
      throw error;
    }
  }

  // Get project statistics
  async getProjectStats() {
    try {
      // Get total projects by status
      const { data: statusStats } = await this.supabase
        .from('projects')
        .select('status');

      // Get total members across all projects
      const { count: totalMembers } = await this.supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total contributions
      const { count: totalContributions } = await this.supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true });

      const stats = {
        totalProjects: statusStats?.length || 0,
        activeProjects: statusStats?.filter(p => p.status === 'active').length || 0,
        completedProjects: statusStats?.filter(p => p.status === 'completed').length || 0,
        totalMembers: totalMembers || 0,
        totalContributions: totalContributions || 0
      };

      return stats;

    } catch (error) {
      throw error;
    }
  }

  // Transform project data to match expected format
  transformProjectData(project, currentUserId = null) {
    try {
      const isUserProject = currentUserId ? project.created_by === currentUserId : false;

      return {
        id: project.id,
        numeric_id: project.numeric_id,
        name: project.name,
        description: project.description,
        status: project.status,
        github_repo_url: project.github_repo_url,
        created_by: project.created_by,
        created_at: project.created_at,
        updated_at: project.updated_at,
        is_user_project: isUserProject,
        members: project.project_members?.map(member => ({
          id: member.id,
          userId: member.user_id,
          role: member.role,
          name: member.user?.full_name || 'Unknown User',
          avatar: member.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.full_name || 'U')}`,
          githubUsername: member.user?.github_username,
          joinedAt: member.joined_at
        })) || []
      };
    } catch (error) {
      throw error;
    }
  }

  // Transform detailed project data
  transformProjectDetailData(project) {
    const baseData = this.transformProjectData(project);
    
    return {
      ...baseData,
      members: project.project_members?.map(pm => ({
        id: pm.id,
        role: pm.role,
        joinedAt: pm.joined_at,
        leftAt: pm.left_at,
        isActive: pm.is_active,
        contributionHours: pm.contribution_hours || 0,
        contributionDescription: pm.contribution_description,
        user: {
          id: pm.user.id,
          name: pm.user.full_name,
          avatar: pm.user.avatar_url || `https://i.pravatar.cc/150?u=${pm.user.id}`
        }
      })) || [],
      contributions: project.contributions?.map(c => ({
        id: c.id,
        type: c.contribution_type,
        title: c.title,
        description: c.description,
        points: c.points_awarded,
        date: c.contribution_date,
        githubUrl: c.github_url,
        user: {
          id: c.user.id,
          name: c.user.full_name,
          avatar: c.user.avatar_url || `https://i.pravatar.cc/150?u=${c.user.id}`
        }
      })) || [],
      meetings: project.meetings?.map(m => ({
        id: m.id,
        title: m.title,
        date: m.date,
        startTime: m.start_time,
        location: m.location,
        type: m.meeting_type,
        attendanceOpen: m.attendance_open
      })) || []
    };
  }

  // Get user's projects
  async getUserProjects(userId) {
    try {
      const projects = await this.getAllProjects({ userId });
      return projects;
    } catch (error) {
      throw error;
    }
  }

  // Get trending projects (most active)
  async getTrendingProjects(limit = 5) {
    try {
      const { data: projects, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          project_members(count),
          contributions(count)
        `)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return projects.map(project => this.transformProjectData(project));

    } catch (error) {
      throw error;
    }
  }

  // Get project members
  async getProjectMembers(projectId) {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch project members');
      }

      // Transform the members data
      const transformedMembers = result.data.map(member => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        name: member.name || 'Unknown User',
        avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}&background=random`,
        githubUsername: member.githubUsername,
        joinedAt: member.joinedAt
      }));

      return transformedMembers;
    } catch (error) {
      throw error;
    }
  }

  // Assign student to project
  async assignStudentToProject(projectId, userId, role = 'member') {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign student');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Remove member from project
  async removeMemberFromProject(projectId, memberId) {
    try {
      const response = await fetch(`/api/projects/${projectId}/members?memberId=${memberId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove member from project');
      }

      return true;

    } catch (error) {
      throw error;
    }
  }

  async getProjectByNumericId(numericId) {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          created_by_user:profiles!projects_created_by_fkey(
            id,
            full_name,
            avatar_url,
            github_username
          ),
          project_members(
            id,
            role,
            is_active,
            user_id,
            joined_at,
            user:profiles(
              id,
              full_name,
              avatar_url,
              github_username
            )
          )
        `)
        .eq('numeric_id', numericId)
        .single();

      if (error) {
        throw error;
      }

      if (!project) {
        throw new Error('Project not found');
      }

      return project;
    } catch (error) {
      throw error;
    }
  }

  async getGitHubProjects() {
    try {
      const response = await fetch('/api/github/repos');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch GitHub projects');
      }

      const data = await response.json();
      
      return data.map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        github_repo_url: repo.html_url,
        status: 'active',
        is_github_project: true,
        tags: repo.topics || [],
        tech_stack: repo.topics || [],
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        stars_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        watchers_count: repo.watchers_count,
        language: repo.language,
        default_branch: repo.default_branch,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url
        }
      }));
    } catch (error) {
      throw error;
    }
  }

  async getAllProjects() {
    try {
      const { data: projects, error } = await this.supabase
        .from('projects')
        .select(`
          id,
          numeric_id,
          name,
          description,
          status,
          created_at,
          created_by_user:profiles!projects_created_by_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching projects: ${error.message}`);
      }

      return projects || [];
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const projectsService = new ProjectsService();
