import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import otherDocumentsMock from './__mocks__/otherDocumentsMock';
import Utils from '../../../helpers/Utils';

const request = supertest;

const clearDatabase = async () => {
  await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  await models.Role.destroy({ force: true, truncate: { cascade: true } });
  await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
  await models.User.destroy({ force: true, truncate: { cascade: true } });
};

describe('create a visa document', () => {
  const {
    user, payload, validDocument, invalidDocument
  } = otherDocumentsMock;
  const token = Utils.generateTestToken(payload);

  beforeAll(async () => {
    await clearDatabase();
    await models.Role.bulkCreate(role);
    await models.User.create(user);
  });
  
  afterAll(async () => {
    await clearDatabase();
  });

  const testClient = () => request(app).post('/api/v1/travelreadiness').set('authorization', token);
  it('fails if an empty object is provided', (done) => {
    testClient()
      .send({ other: {} })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject({});
        done();
      });
  });

  it('creates document of type other when provided with valid data', (done) => {
    testClient().send(validDocument).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(201);
      done();
    });
  });

  it('returns a status code of 400 with expiry date less than issue date is provided', (done) => {
    const errorResponse = {
      success: false,
      message: 'Validation failed',
      errors:
       [
         {
           message: 'expiry date should be greater than date of issue',
           name: 'other.expiryDate'
         }
       ]
    };

    testClient().send(invalidDocument.invalidExpiryDate).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(422);
      expect(res.body).toMatchObject(errorResponse);
      done();
    });
  });

  it('returns a status code of 400 if a document without name is provided', (done) => {
    const errorResponse = {
      success: false,
      message: 'Validation failed',
      errors:
       [{
         message: 'document name should be provided',
         name: 'other.name'
       }]
    };

    testClient().send(invalidDocument.invalidName).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(422);
      expect(res.body).toMatchObject(errorResponse);
      done();
    });
  });

  it('returns error code if a document of type other contains visa keyword', (done) => {
    const errorResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'document that contains visa or passport keyword is not allowed in this category',
          name: 'other.name'
        }
      ]
    };

    testClient().send(invalidDocument.invalidWithVisaKeyword).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(422);
      expect(res.body).toMatchObject(errorResponse);
      done();
    });
  });

  it('returns error code if a document of type other contains passport keyword', (done) => {
    const errorResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'document that contains visa or passport keyword is not allowed in this category',
          name: 'other.name'
        }
      ]
    };

    testClient().send(invalidDocument.invalidWithPassportKeyword).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(422);
      expect(res.body).toMatchObject(errorResponse);
      done();
    });
  });

  it('returns error code while adding a document with a name that already exist', (done) => {
    const errorResponse = {
      success: false,
      message: 'validation error',
      errors: [
        {
          message: 'You already have a document with the same name'
        }
      ]
    };

    testClient().send(validDocument).end((err, res) => {
      if (err) done(err);
      expect(res.status).toEqual(409);
      expect(res.body).toMatchObject(errorResponse);
      done();
    });
  });
});
