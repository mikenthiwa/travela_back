import request from 'supertest';
import moxios from 'moxios';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';
import {
  tripsData,
  mockRequest,
  GuestHouseData,
  GuestHouseRoomData,
  GuestHouseBedData,
  userRequestData,
} from './mocks/deleteRoomMockData';

const payload = {
  UserInfo: {
    userId: '-dhsunwujnsnjjUbhwKNG2',
    fullName: 'captain america',
    name: 'captain america',
    email: 'david.america@andela.com',
    picture: 'fake.png'
  },
};

const userRoles = {
  userId: 9000,
  roleId: 29187
};

const userMock = {
  id: 9000,
  fullName: 'david america',
  userId: '-dhsunwujnsnjjUbhwKNG2',
  location: 'Lagos, Nigeria',
  name: 'captain america',
  email: 'david.america@andela.com',
  picture: 'fake.png'
};

const token = Utils.generateTestToken(payload);

describe('User should not delete a booked room', () => {
  beforeAll(async () => {
    moxios.install();
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    process.env.DEFAULT_ADMIN = 'david.america@andela.com';
    await models.Role.bulkCreate(role);
    await models.User.create(userMock);
    await models.UserRole.create(userRoles);
  });

  afterAll(async () => {
    moxios.uninstall();
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
  });

  describe('SHould not delete a booked room', () => {
    beforeAll(async () => {
      await models.Bed.destroy({ force: true, truncate: { cascade: true } });
      await models.Room.destroy({ force: true, truncate: { cascade: true } });
      await models.GuestHouse.destroy({ force: true, truncate: { cascade: true } });
      await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });

      await models.GuestHouse.create(GuestHouseData);
      await models.Room.bulkCreate(GuestHouseRoomData);
      await models.Bed.bulkCreate(GuestHouseBedData);
      await models.Request.create(mockRequest);
      await models.Trip.bulkCreate(tripsData);
    });
    afterAll(async () => {
      await models.Bed.destroy({ force: true, truncate: { cascade: true } });
      await models.Room.destroy({ force: true, truncate: { cascade: true } });
      await models.GuestHouse.destroy({ force: true, truncate: { cascade: true } });
      await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });
    });
 
    it('should not delete a booked room', (done) => {
      request(app)
        .put('/api/v1/guesthouses/Rh46thdW')
        .set('Content-Type', 'application/json')
        .set('authorization', token)
        .send(userRequestData)
        .end((err, res) => {
          const errorMessage = `You cannot disable this room as it 
          is currently assigned to a travel requester, kindly 
          re-assign the travel requester to another room before disabling`;
          expect(res.body.error).toEqual(errorMessage);
          if (err) return done(err);
          done();
        });
    });
  });
});
