import request from 'supertest';
import express from 'express';
import { createApp } from '../../src/app';
import nock from 'nock';
import { Domain, Action } from '../../src/clients/permission-service.client';
import { randomUUID } from "node:crypto";

const permissionServiceHost = 'localhost';
const permissionServicePort = 3001;
const permissionServiceBaseUrl = `http://${permissionServiceHost}:${permissionServicePort}`;

describe('Project API Integration Tests', () => {
  let app: express.Application;
  let userId: string;

  beforeAll(() => {
    app = createApp({ host: permissionServiceHost, port: permissionServicePort });
  });
  beforeEach(() => {
    userId = randomUUID();
  });
  afterEach(() => {
    nock.cleanAll();
  });

  describe('POST /projects', () => {
    it('should create a project when user has CREATE permission', async () => {
      nock(permissionServiceBaseUrl)
        .get('/permissions/check')
        .query((params) =>
          params.subjectId === userId &&
          params.domain === Domain.PROJECT &&
          params.action === Action.CREATE
        )
        .reply(200, { allowed: true });

      const res = await request(app)
        .post('/projects')
        .set('identity-user-id', userId)
        .send({ name: 'My Project', description: 'Test project' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('My Project');
      expect(res.body.description).toBe('Test project');
      expect(res.body.ownerId).toBe(userId);
    });

    it('should return 401 if no user id', async () => {
      const res = await request(app)
        .post('/projects')
        .send({ name: 'My Project' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if no name', async () => {
      const res = await request(app)
        .post('/projects')
        .set('identity-user-id', userId)
        .send({ description: 'No name' });
      expect(res.status).toBe(400);
    });

    it('should return 403 if CREATE is forbidden', async () => {
      nock(permissionServiceBaseUrl)
        .get('/permissions/check')
        .query((params) =>
          params.subjectId === userId &&
          params.domain === Domain.PROJECT &&
          params.action === Action.CREATE
        )
        .reply(200, { allowed: false });

      const res = await request(app)
        .post('/projects')
        .set('identity-user-id', userId)
        .send({ name: 'Should fail' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /projects', () => {
    it('should return empty list when no projects exist', async () => {
      nock(permissionServiceBaseUrl)
        .get('/permissions/check')
        .query((params) =>
          params.subjectId === userId &&
          params.domain === Domain.PROJECT &&
          params.action === Action.LIST
        )
        .reply(200, { allowed: true });

      const res = await request(app)
        .get('/projects')
        .set('identity-user-id', userId);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should list only user\'s projects', async () => {
      nock(permissionServiceBaseUrl)
        .get('/permissions/check')
        .query((params) =>
          params.subjectId === userId &&
          params.domain === Domain.PROJECT &&
          params.action === Action.CREATE
        )
        .reply(200, { allowed: true });
      nock(permissionServiceBaseUrl)
        .get('/permissions/check')
        .query((params) =>
          params.subjectId === userId &&
          params.domain === Domain.PROJECT &&
          params.action === Action.LIST
        )
        .reply(200, { allowed: true });

      // Create a project for user
      await request(app)
        .post('/projects')
        .set('identity-user-id', userId)
        .send({ name: 'Proj1' });

      const res = await request(app)
        .get('/projects')
        .set('identity-user-id', userId);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Proj1');
      expect(res.body[0].ownerId).toBe(userId);
    });

    it('should return 401 if no user id', async () => {
      const res = await request(app)
        .get('/projects');

      expect(res.status).toBe(401);
    });

    it('should return 403 if LIST is forbidden', async () => {
      nock(permissionServiceBaseUrl)
        .get('/permissions/check')
        .query((params) =>
          params.subjectId === userId &&
          params.domain === Domain.PROJECT &&
          params.action === Action.LIST
        )
        .reply(200, { allowed: false });

      const res = await request(app)
        .get('/projects')
        .set('identity-user-id', userId);

      expect(res.status).toBe(403);
    });
  });
});
