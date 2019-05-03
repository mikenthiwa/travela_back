import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import TravelChecklistHelper from '../../../helpers/travelChecklist';
import {
  requests,
  trips,
  checkListItems,
  defaultItem,
  checklistWithDefaultResponse,
  checkListItemsResources,
  checklistSubmissions,
  lagosCheckListResponse,
  kigaliCheckListResponse,
  nairobiCheckListResponse,
  newyorkCheckListResponse,
  guestHouse,
  rooms,
  beds,
  user,
  centers
} from './__mocks__/mockData';
import { role } from '../../userRole/__tests__/mocks/mockData';


const request = supertest;
const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJpZCI6Ii1MSEptS3J4'; // eslint-disable-line
describe('Travel Checklists Controller', () => {
  const payload = {
    UserInfo: {
      id: '-MUyHJmKrxA90lPNQ1FOLNm',
      name: 'Samuel Kubai',
      userId: '-MUyHJmKrxA90lPNQ1FOLNm',
      location: 'Lagos'
    }
  };

  const payload1 = {
    UserInfo: {
      id: '--MUyHJmKrxA90lPNOLNm',
      name: 'Optimum Price',
      userId: '-MUyHJmKrxA90lPNQ1FOLNm',
      location: 'Lagos'
    },
  };

  const userRole = {
    userId: 10000,
    roleId: 10948,
  };

  beforeAll(async () => {
    await models.Bed.sync({ force: true });
    await models.Room.sync({ force: true });
    await models.GuestHouse
      .destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource
      .destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistSubmission
      .destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItem.sync({ force: true });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.sync({ force: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });

    await models.Role.bulkCreate(role);
    await models.User.create(user);
    await models.UserRole.create(userRole);
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
    await models.ChecklistSubmission
      .destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItemResource
      .destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistItem.sync({ force: true });
    await models.Trip.sync({ force: true });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.Bed.sync({ force: true });
    await models.Room.sync({ force: true });
    await models.GuestHouse
      .destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
  });

  const token = Utils.generateTestToken(payload);
  const token1 = Utils.generateTestToken(payload1);
  describe('GET /api/v1/checklists', () => {
    it('should return 404 status if request is not found', (done) => {
      const expectedResponse = {
        status: 404,
        body: {
          success: false,
          message: 'Validation failed',
          error: 'Request with id \'request-12\' does not exist for this user'
        }
      };

      request(app)
        .get('/api/v1/checklists?requestId=request-12')
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body).toMatchObject(expectedResponse.body);
          done();
        });
    });

    it('should return 404 status if request was not created by the user',
      (done) => {
        const expectedResponse = {
          status: 404,
          body: {
            success: false,
            message: 'Validation failed',
            error: 'Request with id \'request-id-6\' does not exist for this user' // eslint-disable-line
          }
        };

        request(app)
          .get(`/api/v1/checklists?requestId=${requests[0].id}`)
          .set('authorization', token1)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

    it('should return 400 if requestId and destinationName query is provided',
      (done) => {
        const expectedResponse = {
          status: 400,
          body: {
            success: false,
            message: 'Validation failed',
            error: 'You can only have either "requestId" or "destinationName" not both' // eslint-disable-line
          }
        };

        request(app)
          .get(`/api/v1/checklists?requestId=${requests[0].id}&destinationName=Nairobi`)
          .set('authorization', token1)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

    it(`should return 404 status if no
      checklist is available for your request`, (done) => {
      const expectedResponse = {
        status: 404,
        body: {
          success: false,
          error: 'There are no checklist items for your selected destination(s). Please contact your Travel Department.' // eslint-disable-line
        }
      };

      request(app)
        .get('/api/v1/checklists?requestId=request-id-7')
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body).toMatchObject(expectedResponse.body);
          done();
        });
    });

    it('should return 200 status and all travel checklists', (done) => {
      const expectedResponse = {
        status: 200,
        body: {
          success: true,
          message: 'travel checklist retrieved successfully',
          travelChecklists: [
            kigaliCheckListResponse,
            lagosCheckListResponse,
            nairobiCheckListResponse,
            newyorkCheckListResponse
          ]
        }
      };

      request(app)
        .get('/api/v1/checklists')
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body.travelChecklists[3])
            .toMatchObject(expectedResponse.body.travelChecklists[0]);
          done();
        });
    });

    it('should return 200 status and all travel checklists for the requestId',
      (done) => {
        const expectedResponse = {
          status: 200,
          body: {
            success: true,
            message: 'travel checklist retrieved successfully',
            travelChecklists: [
              kigaliCheckListResponse,
              nairobiCheckListResponse,
              newyorkCheckListResponse
            ]
          }
        };

        request(app)
          .get(`/api/v1/checklists?requestId=${requests[0].id}`)
          .set('authorization', token)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body.travelChecklists[2])
              .toMatchObject(expectedResponse.body.travelChecklists[2]);
            done();
          });
      });

    it('should return 200 status and all travel checklists for the destinationName supplied',
      (done) => {
        const testPayload = {
          UserInfo: {
            id: '-MUyHJmKrxA90lPNQ1FOLNm',
            name: 'Samuel Kubai',
            email: 'black.window@andela.com',
            location: 'Lagos'
          }
        };
        user.roleId = 401938;
        const testToken = Utils.generateTestToken(testPayload);
        const expectedResponse = {
          status: 200,
          body: {
            success: true,
            message: 'travel checklist retrieved successfully',
            travelChecklists: [
              kigaliCheckListResponse,
              nairobiCheckListResponse,
              newyorkCheckListResponse
            ]
          }
        };

        request(app)
          .get('/api/v1/checklists?destinationName=Kenya')
          .set('authorization', testToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body.travelChecklists[0])
              .toMatchObject(expectedResponse.body.travelChecklists[1]);
            done();
          });
      });

    it('should return 200 status and all travel checklists for the destinationName supplied',
      (done) => {
        const testPayload = {
          UserInfo: {
            id: '-MUyHJmKrxA90lPNQ1d',
            name: 'Samuel Kubai',
            email: 'wrong.email@andela.com'
          }
        };

        const wrongEmailToken = Utils.generateTestToken(testPayload);
        const expectedResponse = {
          status: 404,
          body: {
            success: false,
            error: 'User not found in database'
          }
        };

        request(app)
          .get('/api/v1/checklists?destinationName=Nairobi')
          .set('authorization', wrongEmailToken)
          .end((err, res) => {
            if (err) done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

    it('should return andela centers', async () => {
      const expectedResponse = {
        Nigeria: 'Nigeria',
        Kenya: 'Kenya',
        Rwanda: 'Rwanda',
        'United States': 'United States',
        Uganda: 'Uganda'
      };

      const andelaCenters = await TravelChecklistHelper.getAndelaCenters();
      expect(andelaCenters).toMatchObject(expectedResponse);
    });
  });

  describe('GET checklist with default item', () => {
    beforeAll(async () => {
      await models.ChecklistItemResource.destroy({
        where: { id: '2' },
        force: true,
        truncate: { cascade: true }
      });
      await models.ChecklistItem.sync({ force: true });
      await models.ChecklistItem.create(defaultItem);
    });

    it('should return default checklist item', (done) => {
      const expectedResponse = {
        status: 200,
        body: {
          success: true,
          message: 'travel checklist retrieved successfully',
          travelChecklists: checklistWithDefaultResponse
        }
      };


      request(app)
        .get(`/api/v1/checklists?requestId=${requests[0].id}`)
        .set('authorization', token)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).toEqual(expectedResponse.status);
          expect(res.body.travelChecklists.length).toEqual(3);
          expect(res.body.travelChecklists[0].destinationName).toEqual('Rwanda');
          expect(res.body.travelChecklists[0].checklist.length).toEqual(1);
          expect(res.body.travelChecklists[0].tripId).toEqual('trip-10');
          done();
        });
    });
  });
});
