import supertest from 'supertest';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import app from '../../../app';
import { role } from '../../userRole/__tests__/mocks/mockData';

let travelRegionId;
const request = supertest(app);
const payload = {
  UserInfo: {
    id: 121212,
    fullName: 'Diana Ombati',
    name: 'Diana Ombati',
    email: 'diana.ombati@andela.com',
    picture: 'fake.png'
  },
};

const userRole = [
  {
    id: 1,
    userId: 121212,
    roleId: 10948,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  {
    id: 1,
    userId: 121212,
    roleId: 29187,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  {
    id: 1,
    userId: 121212,
    roleId: 339458,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  }
];
const admin = Utils.generateTestToken(payload);

describe('Travel Region Controller', () => {
  beforeAll(async () => {
    await models.Role.destroy({ truncate: true, cascade: true, force: true });
    await models.UserRole.destroy({ truncate: true, cascade: true, force: true });
    await models.User.destroy({ truncate: true, cascade: true, force: true });
    await models.TravelRegions.destroy({ truncate: true, cascade: true, force: true });
    await models.User.create({
      id: 121212,
      fullName: 'Diana Ombati',
      name: 'Diana Ombati',
      email: 'diana.ombati@andela.com',
      picture: 'fake.png',
      userId: 'sss',
      location: 'Nairobi, Kenya'
    });
    await models.Role.bulkCreate(role);
    await models.UserRole.bulkCreate(userRole);
  });
  afterAll(async () => {
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.TravelRegions.destroy({ truncate: true, cascade: true });
  });
  it('should create a region successfully',
    (done) => {
      request
        .post('/api/v1/regions')
        .set('authorization', admin)
        .send({ region: 'West-Africa', description: 'Nigeria, Liberia' })
        .end((err, res) => {
          if (err) return done(err);
          const { TravelRegions: { id } } = res.body;
          travelRegionId = id;
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Region created successfully');
          done();
        });
    });
  it('should not create a region that already exists', (done) => {
    request
      .post('/api/v1/regions')
      .set('authorization', admin)
      .send({ region: 'West-Africa', description: 'Nigeria, Liberia' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('A travel region already exists');
        done();
      });
  });
  it('should throw error when input is empty', (done) => {
    request
      .post('/api/v1/regions')
      .set('authorization', admin)
      .send({ region: '', description: '' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Validation failed');
        done();
      });
  });
  it('should returning all regions', (done) => {
    request
      .get('/api/v1/regions')
      .set('authorization', admin)
      .send({ region: '', description: '' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Successfully retrieved regions');
        done();
      });
  });
  it('should update a travel region', (done) => {
    request
      .put(`/api/v1/regions/travelregion/${travelRegionId}`)
      .set('authorization', admin)
      .send({ region: 'West Congo', description: 'helllo congo' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Travel Region Successfuly Updated');
        done();
      });
  });
  it('should not update duplicate travel region', (done) => {
    request
      .put(`/api/v1/regions/travelregion/${travelRegionId}`)
      .set('authorization', admin)
      .send({ region: 'West Congo', description: 'helllo congo' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(409);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('A travel region already exists');
        done();
      });
  });
  it('should fail to update travel region if region is empty', (done) => {
    request
      .put(`/api/v1/regions/travelregion/${travelRegionId}`)
      .set('authorization', admin)
      .send({ region: '', description: 'helllo congo' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(422);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Validation failed');
        expect(res.body.errors).toEqual([{ message: 'region is required', name: 'region' }]);
        done();
      });
  });
  it('should fail to update travel region if region length is greater than 18 characters',
    (done) => {
      request
        .put(`/api/v1/regions/travelregion/${travelRegionId}`)
        .set('authorization', admin)
        .send({ region: 'This is going to be greater than what ai', description: 'helllo congo' })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(422);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Validation failed');
          expect(res.body.errors).toEqual([{
            message: 'Region should not be more than 18 characters',
            name: 'region'
          }]);
          done();
        });
    });
  it('should fail to update travel region if description length is less than 5 characters',
    (done) => {
      request
        .put(`/api/v1/regions/travelregion/${travelRegionId}`)
        .set('authorization', admin)
        .send({ region: 'North London', description: 'hel' })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(422);
          expect(res.body.success).toEqual(false);
          expect(res.body.message).toEqual('Validation failed');
          expect(res.body.errors).toEqual([{
            message: 'Description should not be less than 5 characters',
            name: 'description'
          }]);
          done();
        });
    });
  it('should successfully delete a created travel region', async (done) => {
    request
      .delete(`/api/v1/regions/${travelRegionId}`)
      .set('authorization', admin)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        done();
      });
  });
  it('should return 404 while deleting a non existing region', (done) => {
    request
      .delete('/api/v1/regions/38')
      .set('authorization', admin)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(404);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Travel Region does not exist');
        done();
      });
  });
  it('should fail while deleting a travel region with a wrong param', (done) => {
    request
      .delete('/api/v1/regions/a')
      .set('authorization', admin)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toEqual(400);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Travel region id must be a number');
        done();
      });
  });
});
