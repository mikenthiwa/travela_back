import request from 'supertest';
import moxios from 'moxios';
import app from '../../../app';
import { postGuestHouse } from './mocks/guestHouseData';
import models from '../../../database/models';
import Utils from '../../../helpers/Utils';
import { role } from '../../userRole/__tests__/mocks/mockData';

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'John Snow',
    name: 'John Snow',
    email: 'john.snow@andela.com',
    picture: 'fake.png'
  },
};

const testUsers = [
  {
    id: 987234,
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    fullName: 'John Snow',
    name: 'John Snow',
    location: 'Nairobi, Kenya',
    email: 'john.snow@andela.com',
    picture: 'fake.png'
  }
];

const token = Utils.generateTestToken(payload);

const switchToAdminRole = userToken => (
  request(app)
    .put('/api/v1/user/admin')
    .set('Content-Type', 'application/json')
    .set('authorization', userToken)
);

const createTestGuestHouse = data => (
  request(app)
    .post('/api/v1/guesthouses')
    .set('Content-Type', 'application/json')
    .set('authorization', token)
    .send(data)
);

describe('Guest house details test', () => {
  beforeAll(async () => {
    moxios.install();
    await models.Role.sync({ force: true });
    await models.Role.bulkCreate(role);
    await models.User.sync({ force: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.bulkCreate(testUsers);
    process.env.DEFAULT_ADMIN = 'john.snow@andela.com';
  });

  afterAll(async () => {
    moxios.uninstall();
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  });

  it('should validate start and end dates', (done) => {
    request(app)
      .get('/api/v1/guesthouses/test-guest-house?startDate=invalid')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send()
      .expect(400)
      .end((err, res) => {
        expect(res.body.success).toEqual(false);
        expect(res.body.message).toEqual('Invalid start date or end date');
        done();
      });
  });

  it('should return the correct shape or response', async (done) => {
    await switchToAdminRole(token);
    const { body, status } = await createTestGuestHouse(postGuestHouse);
    const createdGuesthouseId = body.guestHouse.id;
    expect(status).toBe(201);
    const queryString = 'startDate=2018-09-11&endDate=2018-12-12';
    request(app)
      .get(`/api/v1/guesthouses/${createdGuesthouseId}?${queryString}`)
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send()
      .expect(200)
      .end((err, res) => {
        const { rooms } = res.body.guestHouse;
        const { beds } = rooms[0];
        const { trips } = beds[0];
        expect(rooms).toBeInstanceOf(Array);
        expect(beds).toBeInstanceOf(Array);
        expect(trips).toBeInstanceOf(Array);
        done();
      });
  });

  it('should handle unknown guesthouse id', async (done) => {
    const { status, body } = await request(app)
      .get('/api/v1/guesthouses/invalid-guesthouse-id')
      .set('Content-Type', 'application/json')
      .set('authorization', token)
      .send();
    expect(status).toBe(404);
    expect(body.success).toBe(false);
    const errorMsg = 'Guest house with id invalid-guesthouse-id does not exist';
    expect(body.error).toBe(errorMsg);
    done();
  });
});
