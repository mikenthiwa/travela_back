import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';
import {
  payload,
  userRole,
  user,
  checklistData,
  checklistData2,
  travelRegion,
  checklistDataInvalidKeys,
  checklistDataInvalidOrigin,
  checklistDataInvalidDestinationKey,
  tripsData,
  requests
} from './mocks/mockData';

const request = supertest(app);
const token = Utils.generateTestToken(payload);
const url = '/api/v1/dynamic/checklist';

describe('Checklist wizard test', () => {
  beforeAll(async () => {
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.TravelRegions.destroy({ truncate: true, cascade: true });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true, force: true });
    await models.User.create(user);
    await models.Role.bulkCreate(role);
    await models.UserRole.bulkCreate(userRole);
    await models.Request.bulkCreate(requests);
    await models.Trip.bulkCreate(tripsData);
    await models.TravelRegions.create(travelRegion);
  });

  it('should create a checklist wizard',
    (done) => {
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Checklist created successfully');
          done();
        });
    });

  it('should throw an error checklist realtionship already exist',
    (done) => {
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.errors.destinations.message).toEqual('Some of the destinations already exist');
          done();
        });
    });

  it('should create another checklist wizard',
    (done) => {
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData2)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Checklist created successfully');
          done();
        });
    });

  it('should return error: no req.body',
    (done) => {
      request
        .post(url)
        .set('authorization', token)
        .send({})
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('req.body must contains origin, destinations and config keys');
          done();
        });
    });

  it('should return error: Origin cannot be in the destination',
    (done) => {
      request
        .post(url)
        .set('authorization', token)
        .send(checklistDataInvalidOrigin)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Origin cannot be in the destination');
          done();
        });
    });

  it('should return error: Origin cannot be in the destination',
    (done) => {
      request
        .post(url)
        .set('authorization', token)
        .send(checklistDataInvalidDestinationKey)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Destinations must contain countries or regions as keys: regionsss is an invalid key');
          done();
        });
    });

  it('should return error: invalid req.body',
    (done) => {
      request
        .post(url)
        .set('authorization', token)
        .send(checklistDataInvalidKeys)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('req.body must contains only origin, destinations and config keys');
          done();
        });
    });

  it('should return error: invalid origin object',
    (done) => {
      checklistData.origin = {};
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Origin object must contain country or region key');
          done();
        });
    });

  it('should return error: invalid origin object: no country value',
    (done) => {
      checklistData.origin = { country: '' };
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Origin(Country) must be present');
          done();
        });
    });

  it('should return error: invalid origin object: no region value',
    (done) => {
      checklistData.origin = { region: '' };
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Origin(Region) must be present');
          done();
        });
    });

  it('should return error: invalid key in origin object',
    (done) => {
      checklistData.origin = { regions: '' };
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Origin must contain country or region as keys: regions is an invalid key');
          done();
        });
    });

  it('should return error: countries array',
    (done) => {
      checklistData.destinations = { countries: [] };
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Destination must contain countries');
          done();
        });
    });

  it('should return error: countries array empty string',
    (done) => {
      checklistData.destinations = { countries: ['', ''] };
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Countries array should not contain empty string');
          done();
        });
    });

  it('should return error: regions array',
    (done) => {
      checklistData.destinations = { regions: [] };
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Destination must contain regions');
          done();
        });
    });

  it('should return error: regions array empty string',
    (done) => {
      checklistData.destinations = { regions: ['', ''] };
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Regions array should not contain empty string');
          done();
        });
    });

  it('should return error: config not present',
    (done) => {
      checklistData.config = [];
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Config must be present');
          done();
        });
    });

  it('should return error: config type',
    (done) => {
      checklistData.config = ['config'];
      request
        .post(url)
        .set('authorization', token)
        .send(checklistData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Config value must be an object');
          done();
        });
    });

  it('should return all checklists', (done) => {
    request
      .get(url)
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.checklists).toHaveLength(2);
        expect(res.body.checklists[1].origin[0].country.country).toEqual('Nigeria');
        done();
      });
  });

  it('should return a single checklist', (done) => {
    request
      .get(`${url}/requests/${tripsData[0].requestId}`)
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).toEqual('Successfully retrieved checklist');
        expect(res.body.checklists[0].name).toEqual('Nigeria-Kenya');
        done();
      });
  });

  it('should return empty config array when there is no checklist for the trip', (done) => {
    request
      .get(`${url}/requests/${tripsData[1].requestId}`)
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.checklists[0].config).toEqual([]);
        done();
      });
  });
});
