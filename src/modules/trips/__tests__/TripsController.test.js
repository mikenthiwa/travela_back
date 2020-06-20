import request from 'supertest';
import moxios from 'moxios';
import app from '../../../app';
import models from '../../../database/models';
import {
  requestsData,
  tripsData,
  checkInData,
  checkOutData,
  travelAdmin,
  postGuestHouse,
  testUser
} from './mocks/tripData';
import {
  role,
} from '../../userRole/__tests__/mocks/mockData';
import Utils from '../../../helpers/Utils';
import NotificationEngine from '../../notifications/NotificationEngine';
import TripsController from '../TripsController';

global.io = {
  sockets: {
    emit: jest.fn()
  }
};

const travelAdminpayload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'John Snow',
    email: 'john.snow@andela.com',
    name: 'John Snow',
    picture: 'fakePicture.png'
  },
};
const requesterPayload = {
  UserInfo: {
    id: '-AVwHJmKrxA90lPNQ1FOLNn',
    fullName: 'Jack Sparrow',
    email: 'jack.sparrow@andela.com',
    name: 'Jack',
    picture: ''
  },
};

const travelAdminPayload2 = {
  UserInfo: {
    id: '-LJV4b1QTDYewOtk5F65',
    fullName: 'Chris Brown',
    email: 'chris.brown@andela.com',
    name: 'Chris',
    picture: ''
  }
};
const token = Utils.generateTestToken(travelAdminpayload);
const requesterToken = Utils.generateTestToken(requesterPayload);
const travelAdminToken = Utils.generateTestToken(travelAdminPayload2);

describe('Test Suite for Trips Controller', () => {
  beforeAll(async () => {
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.Role.bulkCreate(role);
    await models.User.destroy({ truncate: true, cascade: true });
    await models.User.bulkCreate(testUser);
    process.env.DEFAULT_ADMIN = 'john.snow@andela.com';
  });
  afterAll(async () => {
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
  });

  describe('Setup users', () => {
    beforeEach(async () => {
      moxios.install();
    });
    afterEach(async () => {
      moxios.uninstall();
    });

    it('should change user to admin', async (done) => {
      request(app)
        .put('/api/v1/user/admin')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .end((err, res) => {
          expect(res.body.success).toEqual(true);
          expect(res.body.message)
            .toEqual('Your role has been Updated to a Super Admin');
          if (err) return done(err);
          done();
        });
    });
  });

  describe('Test suite for Trips API', () => {
    beforeAll(async (done) => {
      await models.GuestHouse.destroy({ truncate: true, cascade: true });
      await models.Request.destroy({ truncate: true, cascade: true });
      await models.ChangedRoom.destroy({ truncate: true, cascade: true });
      request(app)
        .post('/api/v1/guesthouses')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .send(postGuestHouse)
        .end(async () => {
          await models.Request.bulkCreate(requestsData);
          await models.Trip.bulkCreate(tripsData);
          done();
        });
    });
    afterAll(async (done) => {
      await models.GuestHouse.destroy({ truncate: true, cascade: true });
      await models.Request.destroy({ truncate: true, cascade: true });
      await models.ChangedRoom.destroy({ truncate: true, cascade: true });
      await models.Notification.destroy({ truncate: true, cascade: true });
      await models.User.destroy({ truncate: true, cascade: true });
      await models.UserRole.destroy({ truncate: true, cascade: true });
      done();
    });
    describe('Test Suite for Trips Check In / Out API: PUT ', () => {
      it('should return error message for an unauthenticated user', async (done) => {
        request(app)
          .put('/api/v1/trips/4')
          .send({})
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toEqual(false);
            expect(res.body.error).toEqual('Please provide a token');
            if (err) return done(err);
            done();
          });
      });

      it('should return error message if user is not owner of the request',
        async (done) => {
          request(app)
            .put('/api/v1/trips/1')
            .send(checkInData)
            .set('Content-Type', 'application/json')
            .set('authorization', requesterToken)
            .end(async (err, res) => {
              await res;
              expect(res.statusCode).toEqual(403);
              expect(res.body.success).toEqual(false);
              expect(res.body.message)
                .toEqual('You don\'t have access to this trip');
              if (err) return done(err);
              done();
            });
        });

      it('should return error if trip does not exist', async (done) => {
        request(app)
          .put('/api/v1/trips/904')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send(checkInData)
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toEqual('Trip does not exist');
            if (err) return done(err);
            done();
          });
      });

      it('should return error if checktype is not provided', async (done) => {
        request(app)
          .put('/api/v1/trips/1')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send({})
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(422);
            expect(res.body.success).toEqual(false);
            expect(res.body.errors[0].message)
              .toEqual('Check type is required');
            if (err) return done(err);
            done();
          });
      });

      it('should return error if check type is invalid', async (done) => {
        request(app)
          .put('/api/v1/trips/1')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send({
            checkType: 'notValid'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(422);
            expect(res.body.success).toEqual(false);
            expect(res.body.errors[0].message)
              .toEqual('checkType must be "checkIn" or "checkOut"');
            if (err) return done(err);
            done();
          });
      });

      it('should not allow checkin if request is not verified', async (done) => {
        request(app)
          .put('/api/v1/trips/1')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send(checkInData)
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('This trip is not verified');
            if (err) return done(err);
            done();
          });
      });

      it(`should not update trip record to check out if user has not been
                checked in`, async (done) => {
        request(app)
          .put('/api/v1/trips/2')
          .set('authorization', token)
          .send(checkOutData)
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('User has either checked out or not checked in');
            if (err) return done(err);
            done();
          });
      });

      it('should not update trip record to check in before due date', async (done) => {
        request(app)
          .put('/api/v1/trips/5')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send(checkInData)
          .end(async (err, res) => {
            await res;
            expect(res.body.success).toEqual(false);
            if (err) return done(err);
            done();
          });
      });

      it('should update trip record to check in', async (done) => {
        const sendMailToTravelAdmin = jest.spyOn(TripsController, 'sendMailToTravelAdmin');
        request(app)
          .put('/api/v1/trips/2')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send(checkInData)
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toEqual(true);
            expect(res.body.trip.id).toEqual('2');
            expect(res.body.trip.checkStatus).toEqual('Checked In');
            expect(sendMailToTravelAdmin).toHaveBeenCalled();
            if (err) return done(err);
            done();
          });
      });

      it(`should not update trip record to check in if user
                has been checked in`,
      async (done) => {
        request(app)
          .put('/api/v1/trips/2')
          .set('authorization', token)
          .send(checkInData)
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toEqual('User has already checked in');
            if (err) return done(err);
            done();
          });
      });

      it('should update trip record to check out successfully', async (done) => {
        const sendSurveyEmail = jest.spyOn(TripsController, 'sendSurveyEmail');
        const sendMailToTravelAdmin = jest.spyOn(TripsController, 'sendMailToTravelAdmin');
        request(app)
          .put('/api/v1/trips/2')
          .set('authorization', token)
          .send(checkOutData)
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toEqual(true);
            expect(res.body.trip.id).toEqual('2');
            expect(res.body.trip.checkStatus).toEqual('Checked Out');
            expect(sendSurveyEmail).toHaveBeenCalled();
            expect(sendMailToTravelAdmin).toHaveBeenCalled();
            if (err) return done(err);
            done();
          });
      });

      it(`should not update trip record to check out if user has been
               checked out`, async (done) => {
        request(app)
          .put('/api/v1/trips/2')
          .set('authorization', token)
          .send(checkOutData)
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('User has either checked out or not checked in');
            if (err) return done(err);
            done();
          });
      });
    });

    describe('Test Suite for Trips API: GET', () => {
      it('should not return anything for a user with no verified request',
        async (done) => {
          request(app)
            .get('/api/v1/trips')
            .set('Content-Type', 'application/json')
            .set('authorization', requesterToken)
            .send({})
            .end(async (err, res) => {
              await res;
              expect(res.statusCode).toEqual(200);
              expect(res.body.success).toEqual(true);
              expect(res.body.trips).toEqual([]);
              if (err) return done(err);
              done();
            });
        });

      it('should return data for a user with verified requests', async (done) => {
        request(app)
          .get('/api/v1/trips')
          .set('Content-Type', 'application/json')
          .set('authorization', token)
          .send({})
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toEqual(true);
            expect(res.body.trips.length).toEqual(4);
            expect(res.body.message).toEqual('Retrieved Successfully');
            if (err) return done(err);
            done();
          });
      });
    });

    describe('Test Suite for Trips Bed/Room: PUT', () => {
      beforeAll(async (done) => {
        try {
          const newUser = await models.User.create(travelAdmin);
          const userAdminRole = {
            userId: newUser.id,
            roleId: '29187'
          };
          await models.UserRole.create(userAdminRole);
          done();
        } catch (error) {
          done();
        }
      });

      it('should require a user token', async (done) => {
        request(app)
          .put('/api/v1/trips/1/room')
          .send({})
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toEqual(false);
            expect(res.body.error).toEqual('Please provide a token');
            if (err) return done(err);
            done();
          });
      });

      it('should not update if user is not a travel admin', async (done) => {
        request(app)
          .put('/api/v1/trips/1/room')
          .set('Content-Type', 'application/json')
          .set('authorization', requesterToken)
          .send({
            bedId: 1
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(403);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Only a Travel Admin can perform this action');
            if (err) return done(err);
            done();
          });
      });

      it('should require bed id', async (done) => {
        request(app)
          .put('/api/v1/trips/99/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({})
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(422);
            expect(res.body.success).toEqual(false);
            expect(res.body.errors[0].message)
              .toEqual('Bed id is required');
            if (err) return done(err);
            done();
          });
      });

      it('should require bed id to be a number', async (done) => {
        request(app)
          .put('/api/v1/trips/99/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 'abc'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(422);
            expect(res.body.success).toEqual(false);
            expect(res.body.errors[0].message)
              .toEqual('Bed id is required and must be a Number');
            if (err) return done(err);
            done();
          });
      });

      it('should require reason', async (done) => {
        request(app)
          .put('/api/v1/trips/99/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 1
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(422);
            expect(res.body.success).toEqual(false);
            expect(res.body.errors[0].message)
              .toEqual('Reason for change is required');
            if (err) return done(err);
            done();
          });
      });

      it('should not update if trip id does not exist', async (done) => {
        request(app)
          .put('/api/v1/trips/99/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 1,
            reason: 'reason'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Trip does not exist');
            if (err) return done(err);
            done();
          });
      });

      it('should not update if bed id does not exist', async (done) => {
        request(app)
          .put('/api/v1/trips/1/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 24,
            reason: 'reason'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Bed does not exist');
            if (err) return done(err);
            done();
          });
      });

      it('should not update if bed is not available', async (done) => {
        request(app)
          .put('/api/v1/trips/1/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 1,
            reason: 'reason'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Bed is currently unavailable');
            if (err) return done(err);
            done();
          });
      });

      it('should not update if trip is checked out', async (done) => {
        request(app)
          .put('/api/v1/trips/4/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 2,
            reason: 'reason'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('This trip is already checked out');
            if (err) return done(err);
            done();
          });
      });


      it('should not update if room is faulty', async (done) => {
        const bed = await models.Bed.findById(2);
        const room = await models.Room.findById(bed.roomId);
        room.faulty = true;
        await room.save();
        request(app)
          .put('/api/v1/trips/1/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 2,
            reason: 'reason'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Room is currently faulty');
            room.faulty = false;
            await room.save();
            if (err) return done(err);
            done();
          });
      });

      it('should not update room if occupied by opposite sex', async (done) => {
        request(app)
          .put('/api/v1/trips/1/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 5,
            reason: 'reason'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(409);
            expect(res.body.success).toEqual(false);
            expect(res.body.message)
              .toEqual('Room is currently occupied or booked by the opposite gender');
            if (err) return done(err);
            done();
          });
      });

      it('should update room/bed record for a trip', async (done) => {
        const notifySpy = jest.spyOn(NotificationEngine, 'notify');
        const sendMailSpy = jest.spyOn(NotificationEngine, 'sendMail');
        request(app)
          .put('/api/v1/trips/1/room')
          .set('Content-Type', 'application/json')
          .set('authorization', travelAdminToken)
          .send({
            bedId: 2,
            reason: 'reason'
          })
          .end(async (err, res) => {
            await res;
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toEqual(true);
            expect(res.body.message)
              .toEqual('Updated Successfully');
            expect(res.body.trip.id).toBe('1');
            expect(res.body.trip.bedId).toBe(2);
            expect(notifySpy).toHaveBeenCalled();
            expect(sendMailSpy).toHaveBeenCalled();
            if (err) return done(err);
            done();
          });
      });

      it('should save the reason in the changed room table', async (done) => {
        const changedRoom = await models.ChangedRoom.findOne({
          where: {
            tripId: '1',
            bedId: 2
          }
        });
        expect(changedRoom.reason).toBe('reason');
        done();
      }, 10000);
    });
  });
});
