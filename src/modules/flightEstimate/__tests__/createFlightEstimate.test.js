import supertest from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import TestSetup from '../helper';
import mockData from './__mocks__/flightEstimateMock';

const request = supertest(app);
const { payload } = mockData;
const token = Utils.generateTestToken(payload);
const url = '/api/v1/flightEstimate';

describe('Flight Estimate', () => {
  beforeAll(async () => {
    await TestSetup.destroyTables();
    await TestSetup.createTables();
  });
  afterAll(async () => {
    await TestSetup.destroyTables();
  });

  it('should return error message for origin and destination must be provided', async () => {
    const res = await request
      .post(url)
      .set('authorization', token)
      .send({
        flightEstimate: '233',
        
      });
    expect(res.status).toEqual(400);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Origin and Destination must be provided and must not be the same'
    });
  });
  it('should return an error message for the same origin and destination', async () => {
    const res = await request
      .post(url)
      .set('authorization', token)
      .send({
        flightEstimate: '233',
        originRegion: 'West Africa',
        originCountry: 'Nigeria'
        
      });
    expect(res.status).toEqual(400);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Origin and Destination must be provided and must not be the same'
    });
  });
  it('should return validation error for flightestimate amount', async () => {
    const res = await request
      .post(url)
      .set('authorization', token)
      .send({
        originRegion: 'West Africa',
        originCountry: 'Nigeria'
        
      });
    expect(res.body).toMatchObject({
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'Amount is required and must be a postive number',
          name: 'flightEstimate'
        },
        {
          message: 'Flight estimate can not be more than 5000 dollars',
          name: 'flightEstimate'
        }
      ]
    });
  });
  it('should successfully create a new flight estimate', async () => {
    const res = await request
      .post(url)
      .set('authorization', token)
      .send({
        flightEstimate: '233',
        originCountry: 'Nigeria',
        destinationCountry: 'Uganda'
        
      });
    expect(res.status).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Successfully created a new flight estimate');
    expect(res.body.flightEstimate).toMatchObject({
      id: 1,
      amount: 233,
      createdBy: '-MUnaemKrxA90lPNQs1FOLNp',
      originCountry: 'Nigeria',
      destinationCountry: 'Uganda',
      originRegion: null,
      destinationRegion: null,
      deletedAt: null
    });
  });
  it('should return an error message for already existing flight estimate', async () => {
    const res = await request
      .post(url)
      .set('authorization', token)
      .send({
        flightEstimate: '233',
        originCountry: 'Nigeria',
        destinationCountry: 'Uganda'
        
      });
    expect(res.status).toEqual(409);
    expect(res.body).toMatchObject({
      success: false,
      message: 'The flight estimate from Nigeria to Uganda already exist'
    });
  });
  it('should return error message empty input fields', async () => {
    const res = await request
      .post(url)
      .set('authorization', token)
      .send({
        flightEstimate: ' ',
        originCountry: '  ',
        destinationCountry: '  ',
        originRegion: '  ',
        destinationRegion: '  '
      });
    expect(res.status).toEqual(422);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'Amount is required and must be a postive number',
          name: 'flightEstimate'
        },
        {
          message: 'Flight estimate can not be more than 5000 dollars',
          name: 'flightEstimate'
        },
        {
          message: 'Origin region must be a string ',
          name: 'originRegion'
        },
        {
          message: 'Flight destination region must be a string',
          name: 'destinationRegion'
        },
        {
          message: 'Flight origin country must be a string',
          name: 'originCountry'
        },
        {
          message: 'Flight destination country must be a string',
          name: 'destinationCountry'
        }
      ]
    });
  });
  it('should get all flight estimates', async () => {
    const res = await request
      .get(url)
      .set('authorization', token);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({
      success: true,
      totalEstimates: 3,
      numberOfPages: 1,
      message: 'Flight Estimates fetched successfully',
      flightEstimates: [
        {
          id: 32242,
          originRegion: 'North America',
          destinationRegion: null,
          originCountry: '',
          destinationCountry: 'Nigeria',
          createdBy: '-MUnaemKrxA90lPNQs1FOLNp',
          amount: 735,
          deletedAt: null,
        },
        {
          id: 32249,
          originRegion: 'Default Region',
          destinationRegion: 'Default Region',
          originCountry: '',
          destinationCountry: '',
          createdBy: '-MUnaemKrxA90lPNQs1FOLNp',
          amount: 750,
          deletedAt: null,
        },
        {
          id: 1,
          originRegion: null,
          destinationRegion: null,
          originCountry: 'Nigeria',
          destinationCountry: 'Uganda',
          createdBy: '-MUnaemKrxA90lPNQs1FOLNp',
          amount: 233,
          deletedAt: null,
        }
      ]
    });
  });
  it('should get all flight estimates with pagination', async () => {
    const res = await request
      .get(`${url}/?page=1&limit=1`)
      .set('authorization', token);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({
      success: true,
      totalEstimates: 3,
      estimatesOnPage: '1',
      currentPage: '1',
      numberOfPages: 3,
      message: 'Flight Estimates fetched successfully',
      flightEstimates: [
        {
          id: 32242,
          originRegion: 'North America',
          destinationRegion: null,
          originCountry: '',
          destinationCountry: 'Nigeria',
          createdBy: '-MUnaemKrxA90lPNQs1FOLNp',
          amount: 735,
          deletedAt: null,
          creator: {
            fullName: 'Kayode Okunlade',
            id: 20000,
          },
        }
      ]
    });
  });

  it('should get a particular flight estimate by id', async () => {
    const res = await request
      .get(`${url}/1`)
      .set('authorization', token);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({
      success: true,
      flightEstimate: {
        id: 1,
        originRegion: null,
        destinationRegion: null,
        originCountry: 'Nigeria',
        destinationCountry: 'Uganda',
        createdBy: '-MUnaemKrxA90lPNQs1FOLNp',
        amount: 233,
        deletedAt: null,
        creator: {
          id: 20000,
          fullName: 'Kayode Okunlade',
          email: 'kayode.dev@andela.com',
          department: null
        }
      }
    });
  });

  it('should return error message for flight estimate that does not exist', async () => {
    const res = await request
      .get(`${url}/234455`)
      .set('authorization', token);
    expect(res.status).toEqual(404);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Flight Estimate with the given id does not exist'
    });
  });
  it('should delete a flight estimate successfully', async () => {
    const res = await request
      .delete(`${url}/1`)
      .set('authorization', token);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Flight Estimate successfully deleted'
    });
  });
  it('should return error message for flight id that is not an interger', async () => {
    const res = await request
      .delete(`${url}/1qw`)
      .set('authorization', token);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Validation failed',
      errors: [{ message: 'Flight estimate must be an integer', name: 'id' }]
    });
  });
  it('should return error message for flight estimate that do not exist', async () => {
    const res = await request
      .delete(`${url}/119`)
      .set('authorization', token);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Flight Estimate with the given id does not exist'
    });
  });
  it('should update a flight estimate successfully', async () => {
    const res = await request
      .put(`${url}/32242`)
      .set('authorization', token)
      .send({
        flightEstimate: '233',
      });
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Flight Estimate Successfully updated'
    });
  });
  it('should return error for id that does not exist', async () => {
    const res = await request
      .put(`${url}/32242674`)
      .set('authorization', token)
      .send({
        flightEstimate: '233',
      });
    expect(res.body).toMatchObject({
      success: false,
      error: 'Flight Estimate with the given id does not exist'
    });
  });
  it('should return error message when flight estimate is more than 5000', async () => {
    const res = await request
      .put(`${url}/32242`)
      .set('authorization', token)
      .send({
        flightEstimate: '23222222',
      });
    expect(res.body).toMatchObject({
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'Flight estimate can not be more than 5000 dollars',
          name: 'flightEstimate'
        }
      ]
    });
  });
  it('should return error when the flight estimate supplied is a negative number', async () => {
    const res = await request
      .put(`${url}/32242`)
      .set('authorization', token)
      .send({
        flightEstimate: '-2222',
      });
    expect(res.body).toMatchObject({
      success: false,
      message: 'Validation failed',
      errors: [
        {
          message: 'Amount is required and must be a postive number',
          name: 'flightEstimate'
        }
      ]
    });
  });
});
