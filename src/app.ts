import express from 'express';
import { HealthController } from './controllers/health.controller';
import { ProjectController } from './controllers/project.controller';
import { IdentityProvider } from './middleware/identity.provider';
import { PermissionServiceClient } from './clients/permission-service.client';
import { ProjectService } from './services/project.service';

export function createApp(permissionServiceConfig: { host: string; port: number }) {
  const app = express();
  app.use(express.json());

  console.log('Creating IdentityProvider...');
  const identityProvider = new IdentityProvider();

  console.log('Creating PermissionServiceClient...');
  const permissionServiceClient = new PermissionServiceClient(permissionServiceConfig);

  console.log('Creating ProjectService...');
  const projectService = new ProjectService(permissionServiceClient);

  console.log('Creating ProjectController...');
  const projectController = new ProjectController(identityProvider, projectService);

  console.log('Creating HealthController...');
  const healthController = new HealthController();

  console.log('Registering routes...');
  app.get('/health', (req, res) => healthController.getHealth(req, res));
  app.post('/projects', (req, res) => projectController.createProject(req, res));
  app.get('/projects', (req, res) => projectController.getProjects(req, res));

  console.log('App created successfully');
  return app;
}