import { v4 as uuidv4 } from 'uuid';
import { PermissionServiceClient, Domain, Action } from '../clients/permission-service.client';

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  tenantId: string;
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

  async createProject(userId: string, tenantId: string, payload: CreateProjectPayload): Promise<Project> {
    console.log(`Creating project for user: ${userId} in tenant: ${tenantId}`);
    const allowed = await this.permissionServiceClient.hasPermission(userId, tenantId, Domain.PROJECT, Action.CREATE);
    if (!allowed) {
      console.error('Forbidden: User not allowed to create project');
      throw new Error('Forbidden');
    }
    const project: Project = {
      id: uuidv4(),
      name: payload.name,
      description: payload.description,
      ownerId: userId,
      tenantId: tenantId,
    };
    this.projects.push(project);
    console.log(`Project created: ${project.id}`);
    return project;
  }

  async getProjects(userId: string, tenantId: string): Promise<Project[]> {
    console.log(`Fetching projects for user: ${userId} in tenant: ${tenantId}`);
    const allowed = await this.permissionServiceClient.hasPermission(userId, tenantId, Domain.PROJECT, Action.LIST);
    if (!allowed) {
      console.error('Forbidden: User not allowed to list projects');
      throw new Error('Forbidden');
    }
    // For simplicity, users see only their own projects within their tenant
    const userProjects = this.projects.filter((p) => p.ownerId === userId && p.tenantId === tenantId);
    console.log(`Found ${userProjects.length} projects for user`);
    return userProjects;
  }
}