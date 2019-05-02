import supertest from 'supertest';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import app from '../../../app';
import { role } from '../../userRole/__tests__/mocks/mockData';


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
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.TravelRegions.destroy({ truncate: true, cascade: true });
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

  it('should create a region successfully',
    (done) => {
      request
        .post('/api/v1/regions')
        .set('authorization', admin)
        .send({ region: 'West-Africa', description: 'Nigeria, Liberia' })
        .end((err, res) => {
          if (err) return done(err);
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
});
