import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import mockData from './__mocks__/listTravelReasonsMock';
import Utils from '../../../helpers/Utils';

const request = supertest;
const {
  user, role, userRole, travelReasons, payload, requesterPayload
} = mockData;

describe('list travel reasons test', () => {
  const prepareTables = async () => {
    await models.TravelReason.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
  };

  beforeAll(async () => {
    await prepareTables();
    await models.User.bulkCreate(user);
    await models.Role.bulkCreate(role);
    await models.UserRole.bulkCreate(userRole);
    await models.TravelReason.bulkCreate(travelReasons);
  });

  afterAll(async () => {
    await prepareTables();
  });

  const token = Utils.generateTestToken(payload);
  const url = '/api/v1/request/reasons';

  it('successfully retrieves all templates and sets default limit to 10', (done) => {
    request(app)
      .get(url)
      .set('Authorization', token)
      .end((err, res) => {
        if (err) done(err);
        const { body: { metaData: { pagination: { count } } } } = res;
        expect(count).toEqual(travelReasons.length);
        done();
      });
  });

  it('retrieves templates equal to the limit provided in a page', (done) => {
    request(app)
      .get(`${url}?page=2&limit=5`)
      .set('Authorization', token)
      .end((err, res) => {
        if (err) done(err);
        const { body: { metaData: { travelReasons: reasons } } } = res;
        expect(reasons.length).toEqual(5);
        done();
      });
  });

  it('allows trips to be retrieved for request creation', (done) => {
    const requesterToken = Utils.generateTestToken(requesterPayload);
    request(app)
      .get(url)
      .set('Authorization', requesterToken)
      .end((err, res) => {
        if (err) done(err);
        expect(res.statusCode).toEqual(200);
        done();
      });
  });

  it('searches and returns only matching entry', (done) => {
    request(app)
      .get(`${url}?page=1&limit=5&search=Test`).set('Authorization', token)
      .end((err, res) => {
        if (err) done(err);
        const { body: { metaData: { travelReasons: reasons } } } = res;
        expect(reasons.length).toEqual(1);
        done();
      });
  });

  it('validates page number', (done) => {
    request(app)
      .get(`${url}?page=2&limit=5c`)
      .set('Authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.statusCode).toEqual(422);
        done();
      });
  });

  it('validates page number', (done) => {
    request(app)
      .get(`${url}?page=2c&limit=5`)
      .set('Authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.statusCode).toEqual(422);
        done();
      });
  });
});
