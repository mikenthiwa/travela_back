import supertest from 'supertest';
import app from '../../../app';
import models from '../../../database/models';
import mockData from './__mocks__/hotelEstimateMock';
import TestSetup from './helper';
import Utils from '../../../helpers/Utils';

const request = supertest(app);

describe('FetchHotelEstimates', () => {
  const { payload, hotelEstimate } = mockData;

  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });
  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  const listCountriesHotelEstimates = (token) => {
    const countryTestRequest = request
      .get('/api/v1/hotelEstimate?country=true')
      .set('Authorization', token);
    return countryTestRequest;
  };
  const listRegionsHotelEstimates = (token) => {
    const regionTestRequest = request.get('/api/v1/hotelEstimate').set('Authorization', token);
    return regionTestRequest;
  };

  const token = Utils.generateTestToken(payload);

  it('retrieves empty hotel estimates successfully', async (done) => {
    await models.HotelEstimate.destroy({ force: true, truncate: { cascade: true } });
    listCountriesHotelEstimates(token).end((err, response) => {
      if (err) done(err);
      expect(response.body.estimates).toHaveLength(0);
      done();
    });
  });

  it('should retrieve all hotel estimates for countries successfully', async (done) => {
    await models.HotelEstimate.bulkCreate(hotelEstimate);
    listCountriesHotelEstimates(token).end((err, response) => {
      if (err) done(err);
      expect(response.statusCode).toEqual(200);
      expect(response.body.estimates).toHaveLength(2);
      done();
    });
  });
  it('should retrieve all hotel estimates for regions successfully', async (done) => {
    listRegionsHotelEstimates(token).end((err, response) => {
      if (err) done(err);
      expect(response.statusCode).toEqual(200);
      expect(response.body.estimates).toHaveLength(1);
      done();
    });
  });
  describe('GET /hotelEstimate/:id', () => {
    it('should fetch one hotelEstimate successfully', (done) => {
      request
        .get('/api/v1/hotelEstimate/100')
        .set('Authorization', token)
        .end((err, res) => {
          if (err) return done();
          expect(res.status).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.hotelEstimate.id).toEqual(100);
          done();
        });
    });

    it('should throw error if estimate does not exist', (done) => {
      request
        .get('/api/v1/hotelEstimate/1000')
        .set('Authorization', token)
        .end((err, res) => {
          if (err) return done();
          expect(res.status).toEqual(404);
          expect(res.body.success).toEqual(false);
          done();
        });
    });
    it('should throw error if estimateId is not an integer', (done) => {
      const expectedResponse = {
        success: false,
        message: 'Validation failed',
        errors: [
          {
            message: 'estimateId should be an integer',
            name: 'id'
          }
        ]
      };
      request
        .get('/api/v1/hotelEstimate/ss')
        .set('Authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toMatchObject(expectedResponse);
          done();
        });
    });
  });
  describe('GET /hotelEstimate/region/:id', () => {
    it('should fetch hotelEstimates of countries within a region successfully', (done) => {
      request
        .get('/api/v1/hotelEstimate/region/1001')
        .set('Authorization', token)
        .end((err, res) => {
          if (err) return done();
          expect(res.status).toEqual(200);
          expect(res.body.success).toEqual(true);
          expect(res.body.estimates).toHaveLength(2);
          done();
        });
    });
    it('should return expected error if region does not exist', (done) => {
      request
        .get('/api/v1/hotelEstimate/region/888')
        .set('Authorization', token)
        .end((err, res) => {
          if (err) return done();
          expect(res.status).toEqual(404);
          expect(res.body.success).toEqual(false);
          expect(res.body.error).toEqual('Region does not exist');
          done();
        });
    });
  });
});
