import supertest from 'supertest';
import app from '../../../app';
import mockPassport from './__mock__/mockPassport';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';

const request = supertest;

describe('Create passport', () => {
  const user = {
    id: '1000',
    fullName: 'Samuel Kubai',
    email: 'black.windows@andela.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    picture: 'Picture',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  };

  const payload = {
    UserInfo: {
      id: '-MUyHJmKrxA90lPNQ1FOLNm',
      name: 'Samuel Kubai'
    }
  };

  const token = Utils.generateTestToken(payload);

  beforeAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Comment.destroy({ force: true, truncate: { cascade: true } });
    await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.create(user);
  });

  afterAll(async () => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.TravelReadinessDocuments.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
  });

  const response = (status, body) => ({
    status,
    body
  });

  it('should return 401 if token is not provided', (done) => {
    const body = {
      success: false,
      error: 'Please provide a token'
    };
    const expectedResponse = response(401, body);
    request(app)
      .post('/api/v1/travelreadiness')
      .send(mockPassport.passportDetail)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });

  it('should add a passport', (done) => {
    request(app)
      .post('/api/v1/travelreadiness')
      .send({ ...mockPassport.passportDetail })
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(201);
        expect(res.body).toMatchObject({});
        done();
      });
  });

  it('should check for empty values', (done) => {
    const expectedResponse = {
      status: 422,
      body: {
        success: false,
        message: 'Validation failed',
        errors: [
          {
            message: 'name is required',
            name: 'passport.name'
          },
          {
            message: 'passport is required',
            name: 'passport.passportNumber'
          },
          {
            message: 'nationality is required',
            name: 'passport.nationality'
          },
          {
            message: 'dateOfBirth is required',
            name: 'passport.dateOfBirth'
          },
          {
            message: 'dateOfIssue is required',
            name: 'passport.dateOfIssue'
          },
          {
            message: 'placeOfIssue is required',
            name: 'passport.placeOfIssue'
          },

          {
            message: 'expiryDate is required',
            name: 'passport.expiryDate'
          },
          {
            message: 'expiry date cannot be before date of issue',
            name: 'passport.expiryDate'
          },
          {
            message: 'cloudinaryUrl is required',
            name: 'passport.cloudinaryUrl'
          }
        ]
      }
    };
    request(app)
      .post('/api/v1/travelreadiness')
      .set('authorization', token)
      .send({ ...mockPassport.emptyPassportDetail })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });

  it('should check for valid cloudinary url', (done) => {
    const body = {
      errors:
        [{ message: 'cloudinaryUrl is not a valid url', name: 'passport.cloudinaryUrl' }],
      message: 'Validation failed',
      success: false
    };

    request(app)
      .post('/api/v1/travelreadiness/')
      .set('authorization', token)
      .send({ ...mockPassport.invalidCloudinaryPassportDetail })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject(body);
        done();
      });
  });

  it('should check for invalid passport number', (done) => {
    const body = {
      errors:
        [{ message: 'passport number is not valid', name: 'passport.passportNumber' }],
      message: 'Validation failed',
      success: false
    };

    request(app)
      .post('/api/v1/travelreadiness/')
      .set('authorization', token)
      .send({ ...mockPassport.invalidPassportDetail })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject(body);
        done();
      });
  });
  it('should check for invalid dates', (done) => {
    const body = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'The date of birth format you provided is not valid, use: MM/DD/YYYY',
          name: 'passport.dateOfBirth'
        },
        {
          message: 'The date of issue format you provided is not valid, use: MM/DD/YYYY',
          name: 'passport.dateOfIssue'
        },
        {
          message: 'The date of issue format you provided is not valid, use: MM/DD/YYYY',
          name: 'passport.expiryDate'
        }
      ]
    };

    request(app)
      .post('/api/v1/travelreadiness/')
      .set('authorization', token)
      .send({ ...mockPassport.invalidDate })
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject(body);
        done();
      });
  });

  it('should check if passport is unique', (done) => {
    const body = {
      success: false,
      message: 'validation error',
      errors: [
        {
          message: 'You already have a passport with the same number'
        }
      ]
    };
    const expectedResponse = response(409, body);
    request(app)
      .post('/api/v1/travelreadiness')
      .send({ ...mockPassport.passportDetail })
      .set('authorization', token)
      .end((err, res) => {
        if (err) done(err);
        expect(res.status).toEqual(expectedResponse.status);
        expect(res.body).toMatchObject(expectedResponse.body);
        done();
      });
  });
});
