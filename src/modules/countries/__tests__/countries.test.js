import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';
import {
  payload,
  userRole,
  user,
  validCountryData,
  emptyCountryData,
  travelRegion
} from './mocks/mockData';

const request = supertest(app);
const token = Utils.generateTestToken(payload);
const url = '/api/v1/regions/1/countries';

describe('Countries controller tests', () => {
  beforeAll(async () => {
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.Country.destroy({ truncate: true, cascade: true });
    await models.TravelRegions.destroy({ truncate: true, cascade: true });
    await models.User.create(user);
    await models.Role.bulkCreate(role);
    await models.UserRole.bulkCreate(userRole);
    await models.TravelRegions.create(travelRegion);
  });
  it('should add country to region successfully', (done) => {
    request
      .post(url)
      .set('authorization', token)
      .send(validCountryData)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Country added successfully');
        done();
      });
  });
  it('should not add a country that already exists', (done) => {
    request
      .post(url)
      .set('authorization', token)
      .send(validCountryData)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Validation failed');
        expect(res.body.errors).toEqual([
          {
            message: 'Kenya has already been added to East-Africa',
            name: 'countries'
          },
          {
            message: 'Uganda has already been added to East-Africa',
            name: 'countries'
          }
        ]);
        done();
      });
  });
  it('should throw error when input is empty', (done) => {
    request
      .post(url)
      .set('authorization', token)
      .send(emptyCountryData)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Validation failed');
        done();
      });
  });
  it('should return an error is a region does not exists', (done) => {
    request
      .post('/api/v1/regions/89965/countries')
      .set('authorization', token)
      .send(validCountryData)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('The region does not exist');
        done();
      });
  });
  it('should fetch all countries in a region', (done) => {
    request
      .get(url)
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Successfully retrieved countries');
        done();
      });
  });
  it('should return an error is a region does not exists when fetching', (done) => {
    request
      .get('/api/v1/regions/89965/countries')
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('The region does not exist');
        done();
      });
  });
});
