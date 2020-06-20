import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import mockData from './__mocks__/travelStipendMock';
import TestSetup from './helper';
import Utils from '../../../helpers/Utils';

const request = supertest;

describe('list TravelStipends', () => {
  const {
    payload, payloadNotAdmin, listOfStipends
  } = mockData;

  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });

  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  const listAllStipends = (token) => {
    const testRequest = request(app)
      .get('/api/v1/travelStipend')
      .set('Authorization', token);
    return testRequest;
  };

  const token = Utils.generateTestToken(payload);
  const nonAdminToken = Utils.generateTestToken(payloadNotAdmin);

  it('should test for a valid token', (done) => {
    listAllStipends(token)
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(200);
        done();
      });
  });

  it('should test for an invalid token', (done) => {
    const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR';
    listAllStipends(invalidToken)
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(401);
        done();
      });
  });
  it('should ensure user is an admin or travel team member', (done) => {
    listAllStipends(token)
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(200);
        done();
      });
  });

  it('should allow all users fetch stipend', (done) => {
    listAllStipends(nonAdminToken)
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(200);
        done();
      });
  });
  
  it('retrieves non-existent travel stipends', async (done) => {
    await models.TravelStipends.destroy({ force: true, truncate: { cascade: true } });
    listAllStipends(token)
      .end((err, response) => {
        if (err) done(err);
        expect(response.body.stipends).toHaveLength(0);
        done();
      });
  });
  it('retrieves all travel stipends', (done) => {
    models.TravelStipends.bulkCreate(listOfStipends);
    listAllStipends(token)
      .end((err, response) => {
        if (err) done(err);
        expect(response.statusCode).toEqual(200);
        expect(response.body.stipends).toHaveLength(3);
        done();
      });
  });
});
