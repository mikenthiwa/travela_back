import request from 'supertest';
import moxios from 'moxios';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import {
  editGuestHouseEpic,
  GuestHouseEpic,
  GuestHouseEpicRoom,
  GuestHouseEpicBed,
  editGuestHouseEpicData,
  GuestHouseEpicData,
  GuestHouseEpicRoomData,
  GuestHouseEpicBedData,
  editGuestHouseEpicData3,
  GuestHouseEpicData3,
  GuestHouseEpicRoomData3,
  GuestHouseEpicBedData3
} from './mocks/guestHouseData';
import { role } from '../../userRole/__tests__/mocks/mockData';

const payload = {
  UserInfo: {
    id: '-TRUniplpknbbh',
    fullName: 'Jones Akili',
    name: 'Jones Akili',
    email: 'jones.akili@andela.com',
    picture: 'fake.png'
  },
};
const token = Utils.generateTestToken(payload);
const invalidToken = 'YYTRYIM0nrbuy7tonfenu';
describe('Update Guest Houses', () => {
  beforeAll(async (done) => {
    moxios.install();
    await models.Role.sync({ force: true });
    await models.Role.bulkCreate(role);
    await models.User.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
    process.env.DEFAULT_ADMIN = 'jones.akili@andela.com';
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=jones.akili@andela.com`, {
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
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });
  });

  describe('Unauthenticated user', () => {
    it('returns 403 error if user is not a travel admin', (done) => {
      request(app)
        .put('/api/v1/guesthouses/rtDHgJ4D')
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
        .put('/api/v1/guesthouses/rtDHgJ4D')
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
        .put('/api/v1/guesthouses/rtDHgJ4D')
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
  describe('Authenticated travel admin edits guest houses', () => {
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
    describe('Authenticated travel admin edits guest houses', () => {
      beforeAll(async () => {
        await models.GuestHouse.destroy({ truncate: true, cascade: true });
        await models.Bed.destroy({ truncate: true, cascade: true });
        await models.Room.destroy({ truncate: true, cascade: true });

        await models.GuestHouse.create(GuestHouseEpic);
        await models.Room.create(GuestHouseEpicRoom);
        await models.Bed.bulkCreate(GuestHouseEpicBed);
      });
      afterAll(async () => {
        await models.Bed.destroy({ truncate: true, cascade: true });
        await models.Room.destroy({ truncate: true, cascade: true });
        await models.GuestHouse.destroy({ truncate: true, cascade: true });
      });

      it(`returns 200 and the appropriate
      message when guesthouses is edited`, (done) => {
        request(app)
          .put('/api/v1/guesthouses/ND56thdW')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send(editGuestHouseEpic.editdata1)
          .expect(200)
          .end((err, res) => {
            expect(res.body.success).toEqual(true);
            if (err) return done(err);
            done();
          });
      });

      it('should add a room if added while editing', (done) => {
        request(app)
          .put('/api/v1/guesthouses/ND56thdW')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send(editGuestHouseEpic.editdata4)
          .end((err, res) => {
            expect(res.body.success).toEqual(true);
            if (err) return done(err);
            done();
          });
      });
      it('should delete a room if removed while making editing request', (done) => {
        request(app)
          .put('/api/v1/guesthouses/ND56thdW')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send(editGuestHouseEpic.editdata5)
          .end((err, res) => {
            expect(res.body.success).toEqual(true);
            if (err) return done(err);
            done();
          });
      });
    });
    
    describe('Authenticated travel admin edits beds', () => {
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
      describe('Authenticated travel admin edits booked beds', () => {
        beforeAll(async () => {
          await models.Bed.destroy({ truncate: true, cascade: true });
          await models.Room.destroy({ truncate: true, cascade: true });
          await models.GuestHouse.destroy({ truncate: true, cascade: true });

          await models.GuestHouse.create(GuestHouseEpicData);
          await models.Room.create(GuestHouseEpicRoomData);
          await models.Bed.bulkCreate(GuestHouseEpicBedData);
        });
        afterAll(async () => {
          await models.Bed.destroy({ truncate: true, cascade: true });
          await models.Room.destroy({ truncate: true, cascade: true });
          await models.GuestHouse.destroy({ truncate: true, cascade: true });
        });

        it('should not update booked beds', (done) => {
          request(app)
            .put('/api/v1/guesthouses/Rh46thdW')
            .set('Content-Type', 'application/json')
            .set('authorization', token)
            .send(editGuestHouseEpicData.editdata5)
            .end((err, res) => {
              expect(res.statusCode).toEqual(409);
              expect(res.body.success).toEqual(false);
              if (err) return done(err);
              done();
            });
        });
      });
    });

    describe('Authenticated travel admin edits same bed numbers', () => {
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
      describe('Authenticated travel admin edits same bed numbers', () => {
        beforeAll(async () => {
          await models.Bed.destroy({ truncate: true, cascade: true });
          await models.Room.destroy({ truncate: true, cascade: true });
          await models.GuestHouse.destroy({ truncate: { cascade: true } });

          await models.GuestHouse.create(GuestHouseEpicData3);
          await models.Room.create(GuestHouseEpicRoomData3);
          await models.Bed.bulkCreate(GuestHouseEpicBedData3);
        });
        afterAll(async () => {
          await models.Bed.destroy({ truncate: { cascade: true } });
          await models.Room.destroy({ truncate: { cascade: true } });
          await models.GuestHouse.destroy({ truncate: true, cascade: true });
        });

        it('should return found beds if number of beds are the same', (done) => {
          request(app)
            .put('/api/v1/guesthouses/qN46thdW')
            .set('Content-Type', 'application/json')
            .set('authorization', token)
            .send(editGuestHouseEpicData3.editdata6)
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body.success).toEqual(true);
              if (err) return done(err);
              done();
            });
        });
      });
    });
  });
});
