import request from 'supertest';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';

import {
  GuestHouseEpic,
  GuestHouseEpicRoom,
  GuestHouseEpicBed,
  maintainanceRecord,
  GuestHouseEpicRoom2,
} from './mocks/guestHouseData';

const userMock = [
  {
    id: 40001,
    fullName: 'Ghost roommate',
    email: 'ghost.roommate@andela.com',
    userId: '-MUnaemKrxA90lPhjkkllFOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 40002,
    fullName: 'Ronald Ndirangu',
    email: 'ronald.ndirangu@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNm',
    location: 'Nairobi',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

const userRoleMock = [
  {
    id: 1,
    userId: 40002,
    roleId: 29187,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 2,
    userId: 40001,
    roleId: 401938,
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];
const travelAdminPayload = {
  UserInfo: {
    id: '-MUnaemKrxA90lPNQs1FOLNm',
    fullName: 'Ronald Ndirangu',
    email: 'ronald.ndirangu@andela.com',
    picture: 'fakePicture.png'
  },
};
const requesterPayload = {
  UserInfo: {
    userId: '-MUnaemKrxA90lPhjkkllFOLNm',
    fullName: 'Ghost roommate',
    email: 'ghost.roommate@andela.com',
    picture: 'fakePicture.png'
  }
};

const updateMaintainanceRecord = {
  reason: 'Leaking pipes',
  start: '11/02/2018',
  end: '11/21/2018'
};

const travelAdminToken = Utils.generateTestToken(travelAdminPayload);
const requesterToken = Utils.generateTestToken(requesterPayload);

describe('Update maintenance record', () => {
  beforeAll(async (done) => {
    await models.Bed.destroy({ truncate: true, cascade: true });
    await models.Room.destroy({ truncate: true, cascade: true });
    await models.GuestHouse.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.Role.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ truncate: true, cascade: true });

    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRoleMock);
    await models.GuestHouse.create({ ...GuestHouseEpic, userId: '-MUnaemKrxA90lPNQs1FOLNm' });
    await models.Room.create(GuestHouseEpicRoom);
    await models.Room.create(GuestHouseEpicRoom2);
    await models.Bed.bulkCreate(GuestHouseEpicBed);
    await models.Maintainance.create({ ...maintainanceRecord, roomId: 'bEu6thdW' });

    request(app)
      .post('/api/v1/room/bEu6thdW/maintainance')
      .set('authorization', travelAdminToken)
      .send(maintainanceRecord)
      .expect(201)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toBe('Room maintainance record created');
        if (err) return done(err);
        done();
      });
  });

  afterAll(async () => {
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Bed.destroy({ truncate: true, cascade: true });
    await models.Room.destroy({ truncate: true, cascade: true });
    await models.GuestHouse.destroy({ truncate: true, cascade: true });
    await models.Maintainance.destroy({ truncate: true, cascade: true });
  });

  it('should return an error if room doesn\'t exist', (done) => {
    request(app)
      .put('/api/v1/room/doesntExist/maintainance')
      .set('authorization', travelAdminToken)
      .send(maintainanceRecord)
      .expect(404)
      .end((err, res) => {
        expect(res.body.message).toBe('The room does not exist');
        if (err) return err;
        done();
      });
  });

  it('should return an error if record doesnt exist', (done) => {
    request(app)
      .put('/api/v1/room/cYu7hypT/maintainance')
      .set('authorization', travelAdminToken)
      .send(maintainanceRecord)
      .expect(404)
      .end((err, res) => {
        expect(res.body.message).toBe('The maintenance record does not exist');
        if (err) return err;
        done();
      });
  });

  it('should update successfully if room exist and user is travel admin', (done) => {
    request(app)
      .put('/api/v1/room/bEu6thdW/maintainance')
      .set('authorization', travelAdminToken)
      .send(updateMaintainanceRecord)
      .expect(200)
      .end((err, res) => {
        expect(res.body.message).toBe('Room maintenance record updated');
        if (err) return err;
        done();
      });
  });

  it('should throw 403 error if room exist and user is not a travel admin', (done) => {
    request(app)
      .put('/api/v1/room/bEu6thdW/maintainance')
      .set('authorization', requesterToken)
      .send(updateMaintainanceRecord)
      .expect(403)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.error)
          .toBe('You don\'t have access to perform this action');
        if (err) return err;
        done();
      });
  });
});
