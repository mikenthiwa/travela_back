import supertest from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import TestSetup from './helper';
import mockData from './__mocks__/travelStipendMock';


const request = supertest(app);
const url = '/api/v1/travelStipend';

describe('TravelStipends', () => {
  const { payload } = mockData;

  beforeAll(async () => {
    await TestSetup.destoryTables();
    await TestSetup.createTables();
  });

  afterAll(async () => {
    await TestSetup.destoryTables();
  });

  const token = Utils.generateTestToken(payload);

  describe('Create Travel Stipends: POST /api/v1/travelStipend', () => {
    it('should throw 422 error if the user does not provide a stipend and a location',
      (done) => {
        const expectedResponse = {
          success: false,
          message: 'Validation failed',
          errors: [
            {
              message: 'stipend is required and must be a positive number',
              name: 'stipend'
            },
            {
              message: 'stipend must not be more than 1000 dollars',
              name: 'stipend'
            },
            {
              message: 'center is required',
              name: 'center'
            }
          ]
        };
        request
          .post(url)
          .set('authorization', token)
          .end((err, res) => {
            if (err) done(err);
            expect(res.body).toMatchObject(expectedResponse);
            done();
          });
      });

    it('should throw 422 error if amount is not a number',
      (done) => {
        const expectedResponse = {
          status: 422,
          body: {
            success: false,
            errors: [
              {
                message: 'stipend is required and must be a positive number',
                name: 'stipend'
              },
              {
                message: 'stipend must not be more than 1000 dollars',
                name: 'stipend'
              },
              {
                message: 'center is required',
                name: 'center'
              }
            ]
          }
        };
        request
          .post(url)
          .set('authorization', token)
          .send({ stipend: 'hrfjfgjf' })
          .end((err, res) => {
            if (err) done(err);
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

    it('should throw 409 error if a travel stipend exists for the location',
      (done) => {
        request
          .post(url)
          .set('authorization', token)
          .send({
            center: 'Lagos',
            stipend: 455
          })
          .expect(409)
          .end((err, res) => {
            if (err) done(err);
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toEqual('A travel stipend already exists for this center');
            done();
          });
      });
    it('should create a new stipend for a location successfully',
      (done) => {
        request
          .post(url)
          .set('authorization', token)
          .send(
            {
              center: 'Nairobi',
              stipend: 75
            }
          )
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.success).toEqual(true);
            expect(res.body.message).toEqual('Successfully created a new travel stipend for Nairobi');
            done();
          });
      });
  });
});
