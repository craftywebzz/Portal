export class GitHubService {
  constructor() {
    this.apiKey = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  }

  async fetchRepositoryDetails(owner, repo) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repoData = await response.json();

      // Fetch contributors
      const contributorsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (contributorsResponse.ok) {
        const contributors = await contributorsResponse.json();
        repoData.contributors = contributors;
      }

      return repoData;
    } catch (error) {
      throw new Error(`Failed to fetch repository details: ${error.message}`);
    }
  }
} 