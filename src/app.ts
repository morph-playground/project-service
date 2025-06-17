import express from 'express';
import { HealthController } from './controllers/health.controller';
import { ProjectController } from './controllers/project.controller';
import { IdentityProvider } from './middleware/identity.provider';
import { PermissionServiceClient } from './clients/permission-service.client';
import { ProjectService } from './services/project.service';

export function createApp(permissionServiceConfig: { host: string; port: number }) {
  const app = express();
  app.use(express.json());
  const identityProvider = new IdentityProvider();
  const permissionServiceClient = new PermissionServiceClient(permissionServiceConfig);
  const projectService = new ProjectService(permissionServiceClient);
  const projectController = new ProjectController(identityProvider, projectService);
  const healthController = new HealthController();
  app.get('/health', (req, res) => healthController.getHealth(req, res));
  app.post('/projects', (req, res) => projectController.createProject(req, res));
  app.get('/projects', (req, res) => projectController.getProjects(req, res));
  return app;
}