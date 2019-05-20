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
  travelRegion,
  travelRegion2
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
    await models.TravelRegions.create(travelRegion2);
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
        expect(res.body.errors.length).toEqual(2);
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
  it('should return a friendly message when there are no countries', (done) => {
    request
      .get('/api/v1/regions/2/countries')
      .set('authorization', token)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toBe(404);
        expect(res.body.message).toEqual('No country records found');
        done();
      });
  });
  it('should get the list of countries and filter down data when a searchTerm is provided',
    (done) => {
      request
        .get(`${url}?searchQuery=Kenya`)
        .set('authorization', token)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.countries[0].country).toEqual('Kenya');
          done();
        });
    });
  it('should return friendly message when there are no search results',
    (done) => {
      request
        .get(`${url}?searchQuery=noCountry`)
        .set('authorization', token)
        .end((err, res) => {
          expect(res.status).toBe(404);
          expect(res.body.message).toEqual('No results found for the searched country');
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
