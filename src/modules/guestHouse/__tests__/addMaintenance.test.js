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
  maintainanceRecord2
} from './mocks/guestHouseData';

const userMock = [
  {
    id: 40001,
    fullName: 'Document ninja',
    email: 'doc.ninja@andela.com',
    userId: '-MUnaemKrxA90lPhjkkllFOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 40002,
    fullName: 'Collins Muru',
    email: 'collins.muru@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNm',
    location: 'Nairobi',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

const userRoleMock = {
  id: 1,
  userId: 40002,
  roleId: 29187,
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01'
};
const payload = {
  UserInfo: {
    id: '--MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'Collins Muru',
    email: 'collins.muru@andela.com',
    picture: 'fakePicture.png'
  },
};
const token = Utils.generateTestToken(payload);


describe('Add maintenance reason', () => {
  beforeAll(async () => {
    await models.GuestHouse.destroy({ truncate: true, cascade: true });
    await models.Bed.destroy({ truncate: true, cascade: true });
    await models.Room.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.GuestHouse.create({ ...GuestHouseEpic, userId: '-MUnaemKrxA90lPNQs1FOLNm' });
    await models.Room.create(GuestHouseEpicRoom);
    await models.Bed.bulkCreate(GuestHouseEpicBed);
    await models.UserRole.create(userRoleMock);
    process.env.DEFAULT_ADMIN = 'collins.muru@andela.com';
  });

  afterAll(async () => {
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Bed.destroy({ truncate: true, cascade: true });
    await models.Room.destroy({ truncate: true, cascade: true });
    await models.GuestHouse.destroy({ truncate: true, cascade: true });
  });
 

  it('returns an error if the room does not exist', () => {
    request(app)
      .post('/api/v1/room/room4/maintainance')
      .set('authorization', token)
      .send(maintainanceRecord)
      .expect(400)
      .end((err, res) => {
        // expect(res.body.success).toEqual(false);
        expect(res.body.message).toBe('The room does not exist');
        if (err) return (err);
      });
  });

  it('returns correct message if the guest room exists', (done) => {
    request(app)
      .post('/api/v1/room/bEu6thdW/maintainance')
      .set('authorization', token)
      .send(maintainanceRecord)
      .expect(201)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toBe('Room maintainance record created');
        if (err) return done(err);
        done();
      });
  });

  it('returns correct message if the request body is wrong', (done) => {
    request(app)
      .post('/api/v1/room/bEu6thdW/maintainance')
      .set('authorization', token)
      .send(maintainanceRecord2)
      .expect(422)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.errors[0].message).toBe('Maintainace reason is required');
        if (err) return done(err);
        done();
      });
  });
});
