import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import {
  requests,
  checkListItems,
  checkListItemsResources,
  checklistSubmissions,
  centers
} from './__mocks__/mockData';
import {
  role
} from '../../userRole/__tests__/mocks/mockData';


const request = supertest;
const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJpZCI6Ii1MSEptS3J4'; // eslint-disable-line
describe('Notifications Controller', () => {
  const payload = {
    UserInfo: {
      id: '--MUyHJmKrxA90lPNQ1FOLNm',
      email: 'captan.ameria@andela.com',
      name: 'Samuel Kubai',
      location: 'Nigeria'
    },
  };

  const userMock = [{
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

  beforeAll(async () => {
    await models.ChecklistItemResource
      .destroy({
        force: true,
        truncate: {
          cascade: true
        }
      });
    await models.ChecklistSubmission
      .destroy({
        force: true,
        truncate: {
          cascade: true
        }
      });
    await models.ChecklistItem.sync({
      force: true
    });
    await models.Request.sync({
      force: true
    });
    await models.Center.sync({
      force: true
    });
    await models.UserRole.destroy({
      force: true,
      truncate: {
        cascade: true
      }
    });
    await models.User.destroy({
      force: true,
      truncate: {
        cascade: true
      }
    });
    await models.Role.destroy({
      force: true,
      truncate: {
        cascade: true
      }
    });

    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRole);
    await models.Center.bulkCreate(centers);
    await models.Request.bulkCreate(requests);
    await models.ChecklistItem.bulkCreate(checkListItems);
    await models.ChecklistItemResource.bulkCreate(checkListItemsResources);
    await models.ChecklistSubmission.bulkCreate(checklistSubmissions);
  });

  afterAll(async () => {
    await models.ChecklistItem.sync({
      force: true
    });
    await models.ChecklistItemResource
      .destroy({
        force: true,
        truncate: {
          cascade: true
        }
      });
    await models.ChecklistSubmission
      .destroy({
        force: true,
        truncate: {
          cascade: true
        }
      });
    await models.ChecklistSubmission.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource.destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItem.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
  });
  describe('GET /api/v1/checklists/deleted', () => {
    const token = Utils.generateTestToken(payload);
    it('should delete a checklist item',
      async () => {
        const response = await request(app)
          .delete('/api/v1/checklists/7')
          .set('authorization', token)
          .send({
            deleteReason: 'This item is no longer applicable'
          });
        expect(response.body.message).toEqual('Checklist item deleted successfully');
      });

    it('should return 404 status if deleted items are not found', (done) => {
      const expectedResponse = {
        status: 404,
        body: {
          success: false,
          error: 'There are currently no deleted travel checklist items for your location'
        }
      };

      request(app)
        .get('/api/v1/checklists/deleted')
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body).toMatchObject(expectedResponse.body);
          done();
        });
    });

    it('should return 200 status and all deleted travel checklists items', (done) => {
      const expectedResponse = {
        status: 200,
        body: {
          success: true,
          message: 'travel checklist retrieved successfully',
        }
      };
      request(app)
        .get('/api/v1/checklists/deleted?destinationName=Nigeria')
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          done();
        });
    });
    it('should return 500 status and all deleted travel checklists items', async () => {
      const expectedResponse = {
        status: 500
      };
      await models.ChecklistItem.destroy({ force: true, truncate: { cascade: true } });
      request(app)
        .get('/api/v1/checklists/deleted?destinationName=Nigeria')
        .set('authorization', token)
        .end((res) => {
          expect(res.status).toEqual(expectedResponse.status);
        });
    });
  });
});
