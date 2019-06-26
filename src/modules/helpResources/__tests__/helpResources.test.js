import supertest from 'supertest';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import app from '../../../app';
import { role } from '../../userRole/__tests__/mocks/mockData';


const request = supertest(app);
const payload = {
  UserInfo: {
    id: 4567,
    fullName: 'Oluebube Egbuna',
    name: 'Oluebube Egbuna',
    email: 'oluebube.egbuna@andela.com',
    picture: 'fake.png'
  },
};

const userRole = [
  {
    id: 1,
    userId: 4567,
    roleId: 10948,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  {
    id: 2,
    userId: 4567,
    roleId: 29187,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  {
    id: 3,
    userId: 4567,
    roleId: 339458,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  }
];
const admin = Utils.generateTestToken(payload);

describe('Help Resources Controller', () => {
  beforeAll(async () => {
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.HelpResources.destroy({ truncate: true, cascade: true });
    await models.User.create({
      id: 4567,
      fullName: 'Oluebube Egbuna',
      name: 'Oluebube Egbuna',
      email: 'oluebube.egbuna@andela.com',
      picture: 'fake.png',
      userId: 'sss',
      location: 'Lagos, Nigeria'
    });
    await models.Role.bulkCreate(role);
    await models.UserRole.bulkCreate(userRole);
  });

  it('should create a resource successfully',
    (done) => {
      request
        .post('/api/v1/_help')
        .set('authorization', admin)
        .send({ link: 'Travel Intranet', address: 'https://sites.google.com/andela.com/travel-intranet/home?authuser=0' })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toEqual(true);
          expect(res.body.message).toEqual('Resource created successfully');
          done();
        });
    });
  it('should not create a resource that already exists', (done) => {
    request
      .post('/api/v1/_help')
      .set('authorization', admin)
      .send({ link: 'Travel Intranet', address: 'https://sites.google.com/andela.com/travel-intranet/home?authuser=0' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('The link label already exists');
        done();
      });
  });
  it('should not create a resource that already exists', (done) => {
    request
      .post('/api/v1/_help')
      .set('authorization', admin)
      .send({ link: 'Travel Intranet40', address: 'https://sites.google.com/andela.com/travel-intranet/home?authuser=0' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('The link address already exists');
        done();
      });
  });
  it('should throw error when link or link address is not provided', (done) => {
    request
      .post('/api/v1/_help')
      .set('authorization', admin)
      .send({ link: '', address: '' })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Both link title and link addresses are required');
        done();
      });
  });
  it('should return all resources', (done) => {
    request
      .get('/api/v1/_help')
      .set('authorization', admin)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Help resources gotten successfully');
        done();
      });
  });
});
