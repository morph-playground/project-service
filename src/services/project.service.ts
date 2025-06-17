import { v4 as uuidv4 } from 'uuid';
import { PermissionServiceClient, Domain, Action } from '../clients/permission-service.client';

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

interface CreateProjectPayload {
  name: string;
  description?: string;
}

export class ProjectService {
  private projects: Project[] = [];
  private permissionServiceClient: PermissionServiceClient;

  constructor(permissionServiceClient: PermissionServiceClient) {
    this.permissionServiceClient = permissionServiceClient;
  }

  async createProject(userId: string, payload: CreateProjectPayload): Promise<Project> {
    const allowed = await this.permissionServiceClient.hasPermission(userId, Domain.PROJECT, Action.CREATE);
    if (!allowed) {
      throw new Error('Forbidden');
    }
    const project: Project = {
      id: uuidv4(),
      name: payload.name,
      description: payload.description,
      ownerId: userId,
    };
    this.projects.push(project);
    return project;
  }

  async getProjects(userId: string): Promise<Project[]> {
    const allowed = await this.permissionServiceClient.hasPermission(userId, Domain.PROJECT, Action.LIST);
    if (!allowed) {
      throw new Error('Forbidden');
    }
    // For simplicity, users see only their own projects
    return this.projects.filter((p) => p.ownerId === userId);
  }
}