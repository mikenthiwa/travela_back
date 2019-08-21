import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import Utils from '../../../helpers/Utils';
import mocks from './__mocks__';

const request = supertest;

describe('Document Types', () => {
  const user = {
    id: 1000,
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    userId: '1000',
    picture: 'Picture',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  };
  const payload = {
    UserInfo: {
      id: 1000,
      name: 'Samuel Kubai',
      email: 'black.windows@andela.com',
    }
  };

  const userRole = {
    id: 1,
    userId: 1000,
    roleId: 10948,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  };

  const token = Utils.generateTestToken(payload);

  beforeAll(async () => {
    await models.Role.bulkCreate(role);
    await models.User.create(user);
    await models.UserRole.create(userRole);
    await models.DocumentTypes.bulkCreate(mocks.documentTypes);
  });

  afterAll(async () => {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.DocumentTypes.destroy({ force: true, truncate: { cascade: true } });
  });

  it('should get all document types', (done) => {
    request(app)
      .get('/api/v1/documents/types')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.documentTypes.length).toBe(3);
        done();
      });
  });

  it('create a document type', (done) => {
    const body = { name: 'new type' };
    request(app)
      .post('/api/v1/documents/types')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.documentType.name).toBe('new type');
        done();
      });
  });

  it('does not allow the creation of duplicate document types', (done) => {
    const body = { name: 'new type' };
    request(app)
      .post('/api/v1/documents/types')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        done();
      });
  });

  it('updates a document type', (done) => {
    const body = { name: 'new type', newName: 'type' };
    request(app)
      .patch('/api/v1/documents/types')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.documentType.name).toBe('type');
        done();
      });
  });

  it('does not update a name to an existing name', (done) => {
    const body = { name: 'visa', newName: 'passport' };
    request(app)
      .patch('/api/v1/documents/types')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        done();
      });
  });

  it('responds with a not found error on an attempt to update a non-existent document type', (done) => {
    const body = { name: 'some type', newName: 'type 2' };
    request(app)
      .patch('/api/v1/documents/types')
      .send(body)
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        done();
      });
  });

  it('deletes a document type', (done) => {
    request(app)
      .delete('/api/v1/documents/types/delete/type')
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        done();
      });
  });
});
