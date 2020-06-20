import supertest from 'supertest';

import app from '../../../app';
import Utils from '../../../helpers/Utils';
import generateMock from './mocks/mockData';
import models from '../../../database/models';
import { requestsMock, mockTrips } from './mocks/teammatesMock';
import { role } from '../../userRole/__tests__/mocks/mockData';

const request = supertest;

const mockDestinationGuestHouse = generateMock.guestHouse({
  userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  location: 'Lagos, Nigeria'
});

const destinationMockRoom = generateMock.room();

const destinationMockBed = generateMock.bed();

const user = {
  id: '1000',
  fullName: 'Samuel Kubai',
  email: 'black.windows@andela.com',
  userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  location: 'Lagos',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01'
};

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    name: 'Samuel Kubai'
  }
};

const userRole = {
  userId: '1000',
  roleId: '401938'
};

const token = Utils.generateTestToken(payload);

describe('Teammates controller', () => {
  beforeAll(async (done) => {
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItem.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
    await models.Bed.destroy({ force: true, truncate: { cascade: true } });
    await models.Room.destroy({ force: true, truncate: { cascade: true } });
    await models.GuestHouse.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.create(user);
    await models.UserRole.create(userRole);
    await models.GuestHouse.create(mockDestinationGuestHouse);
    await models.Room.create(destinationMockRoom);
    await models.Bed.create(destinationMockBed);
    await models.Request.bulkCreate(requestsMock);
    await models.Trip.bulkCreate(mockTrips);
    done();
  });

  afterAll(async (done) => {
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItem.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.Bed.destroy({ force: true, truncate: { cascade: true } });
    await models.Room.destroy({ force: true, truncate: { cascade: true } });
    await models.GuestHouse.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });

    done();
  });

  it('should return all the travelling teammates', (done) => {
    request(app)
      .get('/api/v1/requests/TDD/users')
      .set('authorization', token)
      .end((err, res) => {
        expect(res.status).toEqual(200);
        expect(res.body.teammates.length).toBe(3);
        done();
      });
  });
});
