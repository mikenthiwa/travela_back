// /* eslint-disable */
import request from 'supertest';
import app from '../../../app';
import models from '../../../database/models';

import {
  occupations,
  newOccupation,
  newOccupation1,
  newOccupation2,
  newOccupation3
} from './mocks/mockData';
import Utils from '../../../helpers/Utils';

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    name: 'Samuel Kubai',
    picture: 'this amara',
  },
};


const token = Utils.generateTestToken(payload);
describe('Creating a new occupation', () => {
  beforeAll((done) => {
    models.Occupation.bulkCreate(occupations);
    done();
  });

  it('should add a new occupation to the db', async (done) => {
    request(app)
      .post('/api/v1/occupations')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(newOccupation)
      .expect(201)
      .end((err, res) => {
        const objectResponse = JSON.parse(res.text);
        expect(objectResponse.success).toBe(true);
        expect(res.status).toEqual(201);
        if (err) return done(err);
        done();
      });
  });
  it('should not make request without occupation name', async (done) => {
    request(app)
      .post('/api/v1/occupations')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(newOccupation1)
      .expect(400)
      .end((err, res) => {
        const objectResponse = JSON.parse(res.text);
        expect(objectResponse.message).toBe('new occupation name required');
        expect(res.status).toEqual(400);
        if (err) return done(err);
        done();
      });
  });
  it('should get all occupations', async (done) => {
    request(app)
      .get('/api/v1/occupations')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .end((err, res) => {
        const objectResponse = JSON.parse(res.text);
        expect(objectResponse.success).toBe(true);
        expect(res.status).toEqual(200);
        if (err) return done(err);
        done();
      });
  });
  it('should not a request with a number', async (done) => {
    request(app)
      .post('/api/v1/occupations')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(newOccupation2)
      .expect(400)
      .end((err, res) => {
        const objectResponse = JSON.parse(res.text);
        expect(objectResponse.message).toBe('occupation name should be a string');
        expect(res.status).toEqual(400);
        if (err) return done(err);
        done();
      });
  });
  it('should not create an occupation that already exists', async (done) => {
    request(app)
      .post('/api/v1/occupations')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send(newOccupation3)
      .expect(409)
      .end((err, res) => {
        const objectResponse = JSON.parse(res.text);
        expect(objectResponse.message).toBe('occupation already exists');
        expect(res.status).toEqual(409);
        if (err) return done(err);
        done();
      });
  });
});
