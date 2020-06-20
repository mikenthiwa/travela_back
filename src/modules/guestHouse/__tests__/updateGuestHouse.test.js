import request from 'supertest';
import moxios from 'moxios';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import {
  updateRoomFaultStatus,
  GuestHouseEpic,
  GuestHouseEpicRoom,
  GuestHouseEpicBed,
  GuestHouseDetails,
} from './mocks/guestHouseData';

const payload = {
  UserInfo: {
    id: '-TRUniolpknbnk',
    fullName: 'Collins Muru',
    name: 'Collins Muru',
    email: 'collins.muru@andela.com',
    picture: 'fakePicture.png'
  },
};

const testUsers = [
  {
    id: 634234,
    userId: '-TRUniolpknbnk',
    fullName: 'Collins Muru',
    name: 'Collins Muru',
    location: 'Nairobi, Kenya',
    email: 'collins.muru@andela.com',
    picture: 'fakePicture.png',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const token = Utils.generateTestToken(payload);


describe('Update the room fault status', () => {
  beforeAll(async (done) => {
    moxios.install();
    await models.Role.sync({ force: true });
    await models.Role.bulkCreate(role);
    await models.User.sync({ force: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.bulkCreate(testUsers);
    process.env.DEFAULT_ADMIN = 'collins.muru@andela.com';
    done();
  });
  afterAll(async () => {
    moxios.uninstall();
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  });

  describe('Unauthorized user', () => {
    it('returns an error if the user is not a travel admin', (done) => {
      request(app)
        .put('/api/v1/room/3vgvmM4qY6')
        .set('authorization', token)
        .send(updateRoomFaultStatus.room1)
        .expect(403)
        .end((err, res) => {
          expect(res.body.success).toEqual(false);
          expect(res.body.error)
            .toBe('You don\'t have access to perform this action');
          if (err) return done(err);
          done();
        });
    });

    describe('Update user to a travel admin', () => {
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

      it('returns error if the room does not exist', (done) => {
        request(app)
          .put('/api/v1/room/3vgvmM4qY6')
          .set('authorization', token)
          .send(updateRoomFaultStatus.room1)
          .expect(400)
          .end((err, res) => {
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toBe('The room does not exist');
            if (err) return done(err);
            done();
          });
      });

      describe('Update room fault status', () => {
        beforeAll(async () => {
          await models.Bed.destroy({ truncate: { cascade: true } });
          await models.Room.destroy({ truncate: { cascade: true } });
          await models.GuestHouse.destroy({ truncate: { cascade: true } });
          await models.GuestHouse.create(GuestHouseEpic);
          await models.Room.create(GuestHouseEpicRoom);
          await models.Bed.bulkCreate(GuestHouseEpicBed);
        });
        afterAll(async () => {
          await models.Bed.destroy({ truncate: { cascade: true } });
          await models.Room.destroy({ truncate: { cascade: true } });
          await models.GuestHouse.destroy({ truncate: { cascade: true } });
        });

        it('returns appropriate message if room is updated', (done) => {
          request(app)
            .put('/api/v1/room/bEu6thdW')
            .set('authorization', token)
            .send(updateRoomFaultStatus.room1)
            .expect(201)
            .end((err, res) => {
              expect(res.body.success).toEqual(true);
              expect(res.body.message).toBe('Room maintainance details updated successfully');
              if (err) return done(err);
              done();
            });
        });

        it('returns appropriate message if body of request is wrong', (done) => {
          request(app)
            .put('/api/v1/room/bEu6thdW')
            .set('authorization', token)
            .send(updateRoomFaultStatus.room2)
            .expect(400)
            .end((err, res) => {
              expect(res.body.success).toEqual(false);
              expect(res.body.message).toBe('Room status can only be true or false');
              if (err) return done(err);
              done();
            });
        });
      });

      describe('Disable and Restore Guesthouse', () => {
        beforeAll(async () => {
          await models.GuestHouse.destroy({ truncate: { cascade: true } });
          await models.GuestHouse.create(GuestHouseDetails);
        });
        afterAll(async () => {
          await models.GuestHouse.destroy({ truncate: { cascade: true } });
        });

        it('return error if guesthouse does not exist', (done) => {
          request(app)
            .put('/api/v1/guesthouse/iijkn')
            .set('authorization', token)
            .expect(404)
            .end((err, res) => {
              expect(res.body.success).toEqual(false);
              expect(res.body.message).toBe('This Guest house does not exist');
              if (err) return done(err);
              done();
            });
        });

        it('should successfully disable a guesthouse', (done) => {
          request(app)
            .put('/api/v1/guesthouse/89uih9ef')
            .set('authorization', token)
            .expect(201)
            .end((err, res) => {
              expect(res.body.success).toEqual(true);
              expect(res.body.message).toBe('Guest house has been successfully disabled');
              if (err) return done(err);
              done();
            });
        });

        it('should get a list of disabled guesthouses', (done) => {
          request(app)
            .get('/api/v1/disabledguesthouses')
            .set('authorization', token)
            .expect(200)
            .end((err, res) => {
              expect(res.body.success).toEqual(true);
              expect(res.body.message).toBe('Disabled guesthouses retrieved successfully');
              if (err) return done(err);
              done();
            });
        });

        it('should successfully restore a disabled guest house', (done) => {
          request(app)
            .put('/api/v1/guesthouse/89uih9ef')
            .set('authorization', token)
            .expect(201)
            .end((err, res) => {
              expect(res.body.success).toEqual(true);
              expect(res.body.message).toBe('Guest house has been successfully restored');
              if (err) return done(err);
              done();
            });
        });
      });
    });
  });
});
