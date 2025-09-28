/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createApp } from '../src/main';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('Announcements E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /announcement should create announcement', async () => {
    const res = await request(app.getHttpServer())
      .post('/announcement')
      .send({ title: 'Test', description: 'Desc' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /announcement should return array', async () => {
    const res = await request(app.getHttpServer()).get('/announcement');
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PATCH /announcement/:id should update status', async () => {
    const create = await request(app.getHttpServer())
      .post('/announcement')
      .send({ title: 'Test Patch', description: 'Desc' });

    const id = create.body.id;

    const patch = await request(app.getHttpServer())
      .patch(`/announcement/${id}`)
      .send({ status: 'closed' });

    expect(patch.status).toBe(200);
    expect(patch.body.status).toBe('closed');
  });
});
