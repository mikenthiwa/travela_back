import request from 'supertest';
import moxios from 'moxios';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import { postGuestHouse } from './mocks/guestHouseData';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';

const payload = {
  UserInfo: {
    id: '-TRUniolpknbbh',
    fullName: 'Jane Doe',
    name: 'Jane Doe',
    email: 'jane.doe@andela.com',
    picture: 'fake.png'
  },
};

const token = Utils.generateTestToken(payload);
const invalidToken = 'YYTRYIM0nrbuy7tonfenu';

describe('Get Guest Houses', () => {
  beforeAll(async (done) => {
    moxios.install();
    await models.Role.sync({ force: true });
    await models.Role.bulkCreate(role);
    await models.User.sync({ force: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.GuestHouse.destroy({ truncate: true, cascade: true });

    process.env.DEFAULT_ADMIN = 'jane.doe@andela.com';
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=jane.doe@andela.com`, {
      status: 200,
      response: {
        values: [{
          bamboo_hr_id: '01',
        }]
      }
    });
    moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', '01'), {
      status: 200,
      response: {
        workEmail: 'lisa.doe@andela.com',
        supervisorEId: '92'
      }
    });
    moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', '92'), {
      status: 200,
      response: {
        id: '92',
        displayName: 'ssewilliam',
        firstName: 'William',
        lastName: 'Sserubiri',
        jobTitle: 'Engineering Team Lead',
        department: 'Partner-Programs',
        location: 'Kenya',
        workEmail: 'william.sserubiri@andela.com',
        supervisorEId: '9',
        supervisor: 'Samuel Kubai'
      }
    });
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?bamboo_hr_id=92`, {
      status: 200,
      response: {
        values: [{
          email: 'william.sserubiri@andela.com',
          name: 'ssewilliam',
          id: '92',
          location: { name: 'Kampala' },
          picture: 'http//:gif.jpg'
        }]
      }
    });
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=william.sserubiri@andela.com`, {
      status: 200,
      response: {
        values: [{
          email: 'william.sserubiri@andela.com',
          name: 'ssewilliam',
          id: '92',
          location: {
            name: 'Kampala'
          },
          picture: 'http//:gif.jpg'
        }]
      }
    });
    request(app)
      .post('/api/v1/user')
      .set('authorization', token)
      .send({ location: 'Lagos' })
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  afterAll(async () => {
    moxios.uninstall();
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.sync({ force: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.GuestHouse
      .destroy({ force: true, truncate: { cascade: true } });
  });

  describe('Unauthenticated user', () => {
    it('returns 401 error if user is not a travel admin', (done) => {
      request(app)
        .get('/api/v1/guesthouses')
        .set('authorization', token)
        .expect(403)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.error)
            .toEqual('You don\'t have access to perform this action');
          if (err) return done(err);
          done();
        });
    });
    it('returns 401 error if user does not supply a token', (done) => {
      request(app)
        .get('/api/v1/guesthouses')
        .expect(401)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.error)
            .toEqual('Please provide a token');
          if (err) return done(err);
          done();
        });
    });
    it('returns 401 error if user supplies an invalid token', (done) => {
      request(app)
        .get('/api/v1/guesthouses')
        .expect(401)
        .set('authorization', invalidToken)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.error)
            .toEqual('Token is not valid');
          if (err) return done(err);
          done();
        });
    });
  });
  describe('Authenticated travel admin', () => {
    beforeAll((done) => {
      request(app)
        .put('/api/v1/user/admin')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });

    it(`returns 200 and the appropriate message when
      there are no guesthouses`, (done) => {
      request(app)
        .get('/api/v1/guesthouses')
        .set('authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message)
            .toEqual('No guesthouse exists at the moment');
          if (err) return done(err);
          done();
        });
    });
    describe('Authenticated travel admin with guesthouse', () => {
      beforeAll((done) => {
        request(app)
          .post('/api/v1/guesthouses')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send(postGuestHouse)
          // eslint-disable-next-line
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });
      it(`returns 200 and the appropriate
      message when guesthouses exists`, (done) => {
        request(app)
          .get('/api/v1/guesthouses')
          .set('authorization', token)
          .expect(200)
          .end((err, res) => {
            expect(res.body.success).toEqual(true);
            expect(res.body.message)
              .toEqual('Guesthouses retrieved successfully');
            expect(res.body.guestHouses.length).toEqual(1);
            done();
          });
      });
    });
  });
});
