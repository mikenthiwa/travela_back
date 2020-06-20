/* eslint-disable */
import supertest from 'supertest';
import cron from 'node-cron';
import cloudinary from 'cloudinary';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import {
  checkListItems,
  checkListItemsResources,
  checklistSubmissions,
  trips,
  requests,
  guestHouse,
  rooms,
  beds,
  centers
} from './__mocks__/mockData';
import { role } from '../../userRole/__tests__/mocks/mockData';

cron.schedule = jest.fn();
cloudinary.v2 = {
  api: {
    delete_resources_by_tag: jest.fn()
  }
};

jest.useFakeTimers();
const request = supertest;

const payload = {
  UserInfo: {
    id: '--MUyHJmKrxA90lPNQ1FOLNm',
    email: 'captan.ameria@andela.com',
    name: 'Samuel Kubai',
    location: 'Nigeria'
  },
};

const invalidTokenPayload = {
  UserInfo: {
    fullName: 'Jame Jones',
    email: 'captan.isthmus@andela.com',
    userId: '--MUyHJmKrxA90lPNQ1FOLN2',
  }
};

const userMock = [
  {
    id: 40000,
    fullName: 'Samuel Kubai',
    email: 'captan.ameria@andela.com',
    userId: '--MUyHJmKrxA90lPNQ1FOLNm',
    location: 'Nigeria',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 40001,
    fullName: 'Sweetness',
    email: 'captan.egypt@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];
const userRole = [{
  userId: 40000,
  roleId: 29187
}, {
  userId: 40001,
  roleId: 401938
}];


const token = Utils.generateTestToken(payload);
const invalidToken =  Utils.generateTestToken(invalidTokenPayload);

describe('Travel ChecklistController', () => {
  beforeAll(async () => {
    await models.Bed.sync({ force: true });
    await models.Room.sync({ force: true });
    await models.GuestHouse
      .destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItem.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.sync({ force: true });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRole);
    await models.GuestHouse.create(guestHouse);
    await models.Room.bulkCreate(rooms);
    await models.Bed.bulkCreate(beds);
    await models.Center.bulkCreate(centers);
    await models.Request.bulkCreate(requests);
    await models.Trip.bulkCreate(trips);
    await models.ChecklistItem.bulkCreate(checkListItems);
    await models.ChecklistItemResource.bulkCreate(checkListItemsResources);
    await models.ChecklistSubmission.bulkCreate(checklistSubmissions);
  });

  afterAll(async () => {
    await models.Bed.sync({ force: true });
    await models.Room.sync({ force: true });
    await models.GuestHouse
      .destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItem.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.sync({ force: true });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
  });

  describe('Delete /api/v1/checklist/:checklistId', () => {
    it('should return an error if no reason for deletion is provided',
    (done) => {
      const expectedReason = [
        {
          "location": "body",
          "msg": "Reason for deletion is required",
          "param": "deleteReason"
        }
      ];

      request(app)
      .delete('/api/v1/checklists/4')
      .set('authorization', token)
      .end((err, res) => {
          expect(res.body.errors).toEqual(expectedReason);
          done();
        })
    });

    it('should delete a checklist item',
    async () => {
      const response = await request(app)
        .delete('/api/v1/checklists/7')
        .set('authorization', token)
        .send({
          deleteReason: 'No longer applicable'
        });
        expect(response.body.message).toEqual('Checklist item deleted successfully');
        expect(response.body.checklistItem).toBeInstanceOf(Object);
    });

    it('should return an error for unavailable checklist item',
    async () => {
      const response = await request(app)
        .delete('/api/v1/checklists/100')
        .set('authorization', token)
        .send({
          deleteReason: 'No longer applicable'
        });
        expect(response.body.message).toEqual('Checklist item not found');
    });

    it('should return an error for wrong token',
    async () => {
      const response = await request(app)
        .delete('/api/v1/checklists/1')
        .set('authorization', invalidToken)
        expect(response.body.message)
          .toEqual('You are not signed in to the application');
    });
  });
});
