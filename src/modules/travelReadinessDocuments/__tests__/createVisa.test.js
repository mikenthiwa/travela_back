import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import createVisaMock from './__mocks__/createVisaMock';
import Utils from '../../../helpers/Utils';

const request = supertest;

const prepareDatabase = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

describe('create a visa document', () => {
  const {
    user, payload, validVisa, invalidDocument, passport
  } = createVisaMock;
  const token = Utils.generateTestToken(payload);

  beforeAll(async () => {
    await prepareDatabase();
    await models.Role.bulkCreate(role);
    await models.User.create(user);
  });
  
  afterAll(async () => {
    await prepareDatabase();
  });

  const testClient = () => request(app).post('/api/v1/travelreadiness').set('authorization', token);
  it('fails if an empty object is provided', (done) => {
    testClient()
      .send({ visa: {} })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject({});
        done();
      });
  });

  it('creates a visa document when provided with valid data', (done) => {
    testClient().send(validVisa).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(201);
      done();
    });
  });

  it('accepts a passport', (done) => {
    testClient().send(passport).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(201);
      done();
    });
  });

  it('returns a status code of 400 if anonymous document is provided', (done) => {
    testClient().send(invalidDocument).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(400);
      done();
    });
  });

  it('returns error when the same visa is added again', (done) => {
    testClient().send(validVisa).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(409);
      done();
    });
  });

  it('returns error when the country is missing in visa detail', (done) => {
    const errorBody = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'country should be provided',
          name: 'visa.country'
        }
      ]
    };
    testClient().send(invalidDocument.countyMissing).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(422);
      expect(res.body).toMatchObject(errorBody);
      done();
    });
  });
});
