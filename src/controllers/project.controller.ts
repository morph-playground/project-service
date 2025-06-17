import { Request, Response } from 'express';
import { IdentityProvider } from '../middleware/identity.provider';
import { ProjectService } from '../services/project.service';

export class ProjectController {
  private identityProvider: IdentityProvider;
  private projectService: ProjectService;

  constructor(identityProvider: IdentityProvider, projectService: ProjectService) {
    this.identityProvider = identityProvider;
    this.projectService = projectService;
  }

  async createProject(req: Request, res: Response): Promise<void> {
    console.log('Creating a new project...');
    const userId = this.identityProvider.getUserId(req);
    if (!userId) {
      console.error('Unauthorized request');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { name, description } = req.body;
    if (!name) {
      console.error('Name is required');
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    try {
      const project = await this.projectService.createProject(userId, { name, description });
      console.log('Project created:', project);
      res.status(201).json(project);
    } catch (err: any) {
      if (err.message === 'Forbidden') {
        console.error('Forbidden request:', err);
        res.status(403).json({ error: 'Forbidden' });
      } else {
        console.error('Internal Server Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async getProjects(req: Request, res: Response): Promise<void> {
    console.log('Retrieving projects...');
    const userId = this.identityProvider.getUserId(req);
    if (!userId) {
      console.error('Unauthorized request');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      const projects = await this.projectService.getProjects(userId);
      console.log('Projects retrieved:', projects);
      res.status(200).json(projects);
    } catch (err: any) {
      if (err.message === 'Forbidden') {
        console.error('Forbidden request:', err);
        res.status(403).json({ error: 'Forbidden' });
      } else {
        console.error('Internal Server Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}