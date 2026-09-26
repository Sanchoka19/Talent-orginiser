import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from '../src/configure-app.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });

  it.each([
    'talents',
    'groups',
    'venues',
    'schedules',
    'duties',
    'inventory',
    'users',
    'roles',
  ])('serves /api/v1/%s', async (resource) => {
    await request(app.getHttpServer()).get(`/api/v1/${resource}`).expect(200);
  });

  it.each(['/', '/talents', '/api/talents', '/api/v2/talents'])(
    'rejects unversioned or unsupported route %s',
    async (path) => {
      await request(app.getHttpServer()).get(path).expect(404);
    },
  );

  it('serves Swagger UI at its stable URL', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs')
      .expect(200);
    expect(response.text).toContain('swagger-ui');
  });

  it('documents the versioned API URLs', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);
    expect(response.body.info.version).toBe('1.0.0');
    const paths = Object.keys(response.body.paths);
    expect(paths).toContain('/api/v1/talents');
    expect(paths).toContain('/api/v1/talents/{id}');
    expect(
      paths.every((path) => path === '/api/v1' || path.startsWith('/api/v1/')),
    ).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});
