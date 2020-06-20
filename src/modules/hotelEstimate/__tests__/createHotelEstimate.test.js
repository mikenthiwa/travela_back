import supertest from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import TestSetup from './helper';
import mockData from './__mocks__/hotelEstimateMock';

const request = supertest(app);
const { payload } = mockData;
const token = Utils.generateTestToken(payload);
const url = '/api/v1/hotelEstimate';

describe('Hotel Estimate', () => {
  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });
  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  it('should throw 422 error if the user does not provide an estimate', (done) => {
    const expectedResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'amount is required and must be a positive number',
          name: 'estimate'
        },
        {
          message: 'amount must not be more than 1000 dollars',
          name: 'estimate'
        }
      ]
    };
    request
      .post(url)
      .set('authorization', token)
      .send({
        country: 'Uganda',
        estimate: ''
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
  });
  it('should throw 422 error if the user does not provide a location', (done) => {
    const expectedResponse = {
      success: false,
      message: 'Please specify a travelRegion or country'
    };
    request
      .post(url)
      .set('authorization', token)
      .send({
        estimate: 10
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
  });
  it('should throw 422 error if country name is empty', (done) => {
    const expectedResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'Country name cannot be empty',
          name: 'country'
        },
        {
          message: 'Country name must be a string',
          name: 'country'
        }
      ]
    };
    request
      .post(url)
      .set('authorization', token)
      .send({
        estimate: 10,
        country: ''
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
  });
  it('should throw 422 error if region name are digits', (done) => {
    const expectedResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'TravelRegion name must be a string',
          name: 'travelRegion'
        }
      ]
    };
    request
      .post(url)
      .set('authorization', token)
      .send({
        travelRegion: '22222',
        estimate: 10
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
  });
  it('should throw 422 error if country name are digits', (done) => {
    const expectedResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'Country name must be a string',
          name: 'country'
        }
      ]
    };
    request
      .post(url)
      .set('authorization', token)
      .send({
        country: '22222',
        estimate: 10
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
  });
  it('should throw 422 error if region name is empty', (done) => {
    const expectedResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'TravelRegion name cannot be empty',
          name: 'travelRegion'
        },
        {
          message: 'TravelRegion name must be a string',
          name: 'travelRegion'
        }
      ]
    };
    request
      .post(url)
      .set('authorization', token)
      .send({
        estimate: 10,
        travelRegion: '    '
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
  });
  it('should throw 422 error if amount is a negative number', (done) => {
    const expectedResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'amount is required and must be a positive number',
          name: 'estimate'
        }
      ]
    };
    request
      .post(url)
      .set('authorization', token)
      .send({ country: 'Uganda', estimate: -10 })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
  });
  it('should throw 422 error if amount is not a number', (done) => {
    const expectedResponse = {
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'amount is required and must be a positive number',
          name: 'estimate'
        },
        {
          message: 'amount must not be more than 1000 dollars',
          name: 'estimate'
        }
      ]
    };
    request
      .post(url)
      .set('authorization', token)
      .send({ country: 'Uganda', estimate: 'jjj' })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
  });
  it('should create a new estimate for a country successfully', (done) => {
    request
      .post(url)
      .set('authorization', token)
      .send({
        country: 'Tanzania',
        estimate: 750
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Successfully created a new hotel estimate');
        done();
      });
  });
  it('should create a new estimate for a region successfully', (done) => {
    request
      .post(url)
      .set('authorization', token)
      .send({
        travelRegion: 'East Africa',
        estimate: 900
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Successfully created a new hotel estimate');
        done();
      });
  });
  it('should not create an estimate that already exists for a region', (done) => {
    request
      .post(url)
      .set('authorization', token)
      .send({
        travelRegion: 'West Africa',
        estimate: 900
      })
      .expect(409)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('A hotel estimate already exists for this region');
        done();
      });
  });
  
  it('should not create an estimate that already exists for a country', (done) => {
    request
      .post(url)
      .set('authorization', token)
      .send({
        country: 'Kenya',
        estimate: 900
      })
      .expect(409)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('A hotel estimate already exists for this country');
        done();
      });
  });
});
