/* eslint-disable */
import supertest from 'supertest';
import cron from 'node-cron';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import {
  checkListItems,
  checkListItemsResources,
  checklistSubmissions
} from './__mocks__/mockData2';
import { role } from '../../userRole/__tests__/mocks/mockData';
import { resources } from 'cloudinary/lib/api';
import { centers, tripsData, requests, guestHouse, rooms, beds
 } from './__mocks__/mockData';

cron.schedule = jest.fn();

const request = supertest;

const payload = {
  UserInfo: {
    id: '--MUyHJmKrxA90lPNQ1FOLNm',
    email: 'captan.ameria@andela.com',
    name: 'Samuel Kubai',
  },
};

const nonTravelAdmin = {
  UserInfo: {
    id: '-MUnaemKrxA90lPNQs1FOLNm',
    email: 'captan.egypt@andela.com',
    name: 'Sweetness',
  }
};

const userMock = [
  {
    id: 30000,
    fullName: 'Samuel Kubai',
    email: 'captan.ameria@andela.com',
    userId: '--MUyHJmKrxA90lPNQ1FOLNm',
    location: 'Nigeria',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  },
  {
    id: 30001,
    fullName: 'Sweetness',
    email: 'captan.egypt@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNm',
    location: 'Lagos',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01'
  }
];

const userRole = [{
  userId: 30000,
  roleId: 29187
}, {
  userId: 30001,
  roleId: 401938
}];

const token = Utils.generateTestToken(payload);
const nonTravelAdminToken = Utils.generateTestToken(nonTravelAdmin);
const invalidToken =  'eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp';

describe('Travel ChecklistController', () => {
  beforeAll(async () => {
    await models.Bed.sync({ force: true });
    await models.Room.sync({ force: true });
    await models.GuestHouse
      .destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItem.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRole);
    await models.GuestHouse.create(guestHouse);
    await models.Room.bulkCreate(rooms);
    await models.Bed.bulkCreate(beds);
    await models.Center.bulkCreate(centers);
    await models.Request.bulkCreate(requests);
    await models.Trip.bulkCreate(tripsData);
    await models.ChecklistItem.bulkCreate(checkListItems);
    await models.ChecklistItemResource.bulkCreate(checkListItemsResources);
    await models.ChecklistSubmission.bulkCreate(checklistSubmissions);
  });

  afterAll(async () => {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.bulkCreate(centers);
    await models.ChecklistItem.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Bed.destroy({ force: true, truncate: { cascade: true } });
    await models.Room.destroy({ force: true, truncate: { cascade: true } });
    await models.GuestHouse.destroy({ force: true, truncate: { cascade: true } });
  });

  describe('Update /api/v1/checklist/:checklistId', () => {
    it('should update a checklist item if the user is a travel or super admin', (done) => {
      const expectedResponse = {
        success: true,
        message: "Checklist item successfully updated",
        updatedChecklistItem: {
            name: "Expenditure",
            requiresFiles: false,
            resources: []
        }
      };
      request(app).put('/api/v1/checklists/7')
      .set('authorization', token)
      .send({
        name: "Expenditure",
        requiresFiles: false,
        resources: [ ]
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
    });

    it('should not update a checklist item if the user is not a travel or super admin', (done) => {
      const expectedResponse = {
        success: false,
        error: 'You don\'t have access to perform this action',
      };
      request(app).put('/api/v1/checklists/7')
      .set('authorization', nonTravelAdminToken)
      .send({
        name: "Expenditure",
        requiresFiles: false,
        resources: [ ]
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
    });

    it('should throw an error if a checklist item is not found', (done) => {
      const expectedResponse = {
        success: false,
        error: "Checklist item cannot be found",
      };
      request(app).put('/api/v1/checklists/70')
      .set('authorization', token)
      .send({
        name: "Expenditure",
        requiresFiles: false,
        resources: [ ]
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).toMatchObject(expectedResponse);
        done();
      });
    });
    it('should restore a deleted checklist item', (done) => {
      const expectedResponse = {
        success: true,
        message: 'Checklist item successfully restored',
        updatedChecklistItem: {
          name: 'Green card',
          destinationName: 'Nigeria',
          requiresFiles: true,
          resources: [{
            id: 'QWz-cHjSJ',
            label: 'National Identity',
            link: 'http://nira.ids.com',
            checklistItemId: '101',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
          }]
        }
      };
      request(app).put('/api/v1/checklists/101')
      .set('authorization', token)
      .send({
        name: 'Green card',
        requiresFiles: true,
        deleteReason: 'kgkgkgm',
        destinationName: 'Nigeria',
        deletedAt: '2018-11-01T13:34:20.109Z',
        resources: [{
          label: 'National Identity',
          link: 'http://nira.ids.com',
          checklistItemId: '101'
        }]
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body.message).toEqual(expectedResponse.message);
        expect(res.body.deletedAt).toEqual(expectedResponse.deletedAt);
        done();
      });
    });

    it('should ensure the name is unique even after update', (done) => {
      const expectedResponse = {
        success: false,
        error: 'Travel checklist items are unique, kindly check your input',
      };
      request(app).put('/api/v1/checklists/101')
      .set('authorization', token)
      .send({
        name: 'Visa Application',
        requiresFiles: true,
        resources: [],
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res.body.message).toEqual(expectedResponse.message);
        done();
      });
    });
  });
});
