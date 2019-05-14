
import request from 'supertest';
import app from '../../../../app';
import models from '../../../../database/models';
import {
  centers,
  requesterPayload,
  travelAdminPayload,
  userRole,
  travelAdmin,
  travelRequester,
  requestsData,
  tripsData,
  postGuestHouse,
  submissionsData
} from './__mocks__/travelCalendarData';
import {
  role,
} from '../../../userRole/__tests__/mocks/mockData';
import Utils from '../../../../helpers/Utils';

const requesterToken = Utils.generateTestToken(requesterPayload);
const travelAdminToken = Utils.generateTestToken(travelAdminPayload);

describe('Test Suite for Travel Calendar Analytics', () => {
  const handleNotFound = (res) => {
    expect(res.statusCode).toEqual(404);
    expect(JSON.parse(res.text).error).toEqual('No records found');
  };

  beforeAll(async () => {
    await models.GuestHouse.destroy({ truncate: true, cascade: true });
    await models.Room.destroy({ truncate: true, cascade: true });
    await models.Bed.destroy({ truncate: true, cascade: true });
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.Request.destroy({ truncate: true, cascade: true });
    await models.Trip.destroy({ truncate: true, cascade: true });
    await models.ChecklistSubmission.destroy({ truncate: true, cascade: true });
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.Role.bulkCreate(role);
    await models.User.create(travelAdmin);
    await models.User.create(travelRequester);
    await models.UserRole.create(userRole);
    await models.Center.bulkCreate(centers);
    await request(app)
      .post('/api/v1/analytics/calendar')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .send(postGuestHouse);
    const bed = models.Bed.findOne({});
    await models.Request.bulkCreate(requestsData);
    await models.Trip.bulkCreate(tripsData(bed.id));
    await models.ChecklistSubmission.bulkCreate(submissionsData);
    process.env.DEFAULT_ADMIN = 'john.snow@andela.com';
  });
  afterAll(async () => {
    await models.GuestHouse.destroy({ truncate: true, cascade: true });
    await models.Room.destroy({ truncate: true, cascade: true });
    await models.Bed.destroy({ truncate: true, cascade: true });
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.Request.destroy({ truncate: true, cascade: true });
    await models.Trip.destroy({ truncate: true, cascade: true });
    await models.ChecklistSubmission.destroy({ truncate: true, cascade: true });
  });
  it('should require a user token', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar')
      .end((err, res) => {
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Please provide a token');
        if (err) return done(err);
        done();
      });
  });

  it('should require user to be a travel Admin', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar')
      .set('Content-Type', 'application/json')
      .set('authorization', requesterToken)
      .end((err, res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('You don\'t have access to perform this action');
        if (err) return done(err);
        done();
      });
  });

  it('should require type and date filters in the query parameter', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        expect(res.statusCode).toEqual(422);
        expect(res.body.success).toEqual(false);
        expect(res.body.errors[0].message)
          .toEqual('type is required');
        expect(res.body.errors[1].message)
          .toEqual('type must be json or file');
        expect(res.body.errors[2].message)
          .toEqual('location is required');
        expect(res.body.errors[3].message)
          .toEqual('dateFrom is required');
        expect(res.body.errors[4].message)
          .toEqual('dateTo is required');
        if (err) return done(err);
        done();
      });
  });

  it('should get travel calendar from admin location', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar?location=Kenya&dateFrom=2018-11-21&dateTo=2018-11-21&type=json&limit=5&page=1')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toEqual(3);
        if (err) return done(err);
        done();
      });
  });

  it('returns multi-trip for final destination ', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar?location=Kigali&dateFrom=2018-11-21&dateTo=2018-11-21&type=json&limit=5&page=1')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toEqual(1);
        if (err) return done(err);
        done();
      });
  });

  it('should return csv file', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar?location=Nairobi&dateFrom=2018-11-21&dateTo=2018-11-21&type=file&limit=5&page=1')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.header['content-type']).toBe('text/csv; charset=utf-8');
        expect(res.header['content-disposition']).toBe(
          'attachment; filename="Travel Calendar Analytics.csv"'
        );
        if (err) return done(err);
        done();
      });
  });

  it('should filter requests by location', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar?location=New York&dateFrom=2018-11-21&dateTo=2018-11-21&type=json&limit=5&page=1')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        handleNotFound(res);
        if (err) return done(err);
        done();
      });
  });

  it('should filter requests by date', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar?location=Nairobi&dateFrom=2018-11-10&dateTo=2018-11-10&type=json&limit=5&page=1')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        handleNotFound(res);
        if (err) return done(err);
        done();
      });
  });

  it('should return a 404 error when no data is available after pagination', (done) => {
    request(app)
      .get('/api/v1/analytics/calendar?location=Nairobi&dateFrom=2018-11-21&dateTo=2018-11-21&type=json&limit&page=10')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        handleNotFound(res);
        if (err) return done(err);
        done();
      });
  });

  it('should return a 404 error when no data is found in the database', async (done) => {
    await models.ChecklistSubmission.destroy({ truncate: true, cascade: true });
    request(app)
      .get('/api/v1/analytics/calendar?location=Nairobi&dateFrom=2018-11-02&dateTo=2018-11-30&type=json&limit=5&page=1')
      .set('Content-Type', 'application/json')
      .set('authorization', travelAdminToken)
      .end((err, res) => {
        handleNotFound(res);
        if (err) return done(err);
        done();
      });
  });
});
