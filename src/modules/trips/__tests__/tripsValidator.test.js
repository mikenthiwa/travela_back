import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import {
  user, userRole, mockRequest, mockTrip, payload, trips, invalidTrip
} from './mocks/tripData';
import mockData from '../../travelReasons/__tests__/__mocks__/listTravelReasonsMock';
import Utils from '../../../helpers/Utils';

const request = supertest(app);
const { role } = mockData;
const token = Utils.generateTestToken(payload);
const url = '/api/v1/trips';

describe('trips validator', () => {
  const prepareTables = async () => {
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
  };
  beforeAll(async () => {
    await prepareTables();
    await models.User.bulkCreate(user);
    await models.Role.bulkCreate(role);
    await models.UserRole.bulkCreate(userRole);
    await models.Request.bulkCreate(mockRequest);
    await models.Trip.bulkCreate(mockTrip);
  });

  afterAll(async () => {
    await prepareTables();
  });

  it('returns status code of 200 if trip is unique', (done) => {
    request.post(url)
      .set('Authorization', token)
      .send({
        trips
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.statusCode).toEqual(200);
        done();
      });
  });

  it('returns a status code of 409 if trip already exists', (done) => {
    const existingTrip = [{
      origin: 'Nairobi, Kenya',
      destination: 'Lagos, Nigeria',
      departureDate: '2019-07-23',
      returnDate: '2019-07-27',
      bedId: -1
    }];
    request.post(url)
      .set('Authorization', token)
      .send({
        trips: existingTrip
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.statusCode).toEqual(409);
        done();
      });
  });

  it('returns a status code of 422 if origin is not provided', (done) => {
    request.post(url)
      .set('Authorization', token)
      .send({ trips: invalidTrip })
      .end((err, res) => {
        if (err) done(err);
        expect(res.statusCode).toEqual(422);
        done();
      });
  });
});
