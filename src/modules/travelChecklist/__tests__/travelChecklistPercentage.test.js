import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import {
  requests,
  trips,
  checkListItems,
  checkListItemsResources,
  checklistSubmissions,
  guestHouse,
  rooms,
  beds,
} from './__mocks__/mockData';

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    name: 'Samuel Kubai'
  }
};

const user = {
  id: 3457,
  fullName: 'black window ',
  email: 'clintfidel@andela.com',
  userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  roleId: 10948,
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01',
  location: 'Kigali, Rwanda'
};

const token = Utils.generateTestToken(payload);
const request = supertest;

describe('Checklist Percentage', () => {
  beforeAll(async () => {
    try {
      await models.User.destroy({ force: true, truncate: { cascade: true } });
      await models.Bed.sync({ force: true });
      await models.Room.sync({ force: true });
      await models.GuestHouse
        .destroy({ force: true, truncate: { cascade: true } });
      await models.ChecklistItemResource
        .destroy({ force: true, truncate: { cascade: true } });
      await models.ChecklistSubmission
        .destroy({ force: true, truncate: { cascade: true } });
      await models.ChecklistItem.sync({ force: true });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.sync({ force: true });

      await models.User.create(user);
      await models.GuestHouse
        .create({ ...guestHouse, userId: user.userId });
      await models.Room.bulkCreate(rooms);
      await models.Bed.bulkCreate(beds);
      await models.Request.create(requests[0]);
      await models.Request.create(requests[2]);
      await models.Trip.create(trips[0]);
      await models.ChecklistItem.bulkCreate(checkListItems);
      await models.ChecklistItemResource.bulkCreate(checkListItemsResources);
      await models.ChecklistSubmission.bulkCreate(checklistSubmissions);
    } catch (error) {
      return null;
    }
  });


  afterAll(async () => {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Bed.sync({ force: true });
    await models.Room.sync({ force: true });
    await models.GuestHouse
      .destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.sync({ force: true });
    await models.ChecklistItem.sync({ force: true });
    await models.ChecklistItemResource
      .destroy({ force: true, truncate: { cascade: true } });
    await models.ChecklistSubmission
      .destroy({ force: true, truncate: { cascade: true } });
  });

  describe('Trave checklist Percentage Percentage', () => {
    it('should get all request including travechecklist percentage as 0 for open request',
      (done) => {
        const expectedResponse = {
          status: 200,
          message: 'Requests retrieved successfully',
          body: {
            success: true,
            requests: [
              {
                createdAt: '2018-08-16T11:11:52.181Z',
                department: 'TDD',
                gender: 'Male',
                id: 'request-id-6',
                manager: 'Ogooluwa Akinola',
                name: 'Samuel Kubai',
                picture: 'test.photo.test',
                role: 'Senior Consultant',
                status: 'Open',
                travelCompletion: '0% complete',
                tripType: 'multi',
                trips: [{
                  bedId: 1,
                  checkInDate: '2018-11-03T00:00:00.000Z',
                  checkOutDate: null,
                  checkStatus: 'Not Checked In',
                  createdAt: '2018-10-05T08:36:11.170Z',
                  departureDate: '2018-11-02',
                  destination: 'Kigali, Rwanda',
                  id: 'trip-10',
                  lastNotifyDate: null,
                  notificationCount: 0,
                  origin: 'Lagos, Nigeria',
                  requestId: 'request-id-6',
                  returnDate: '2019-02-10',
                },
                ],
                userId: '-MUyHJmKrxA90lPNQ1FOLNm',
              },
              {
                id: 'request-id-8',
                name: 'Samuel Kubai',
                status: 'Verified',
                gender: 'Male',
                manager: 'Ogooluwa Akinola',
                department: 'TDD',
                role: 'Senior Consultant',
                tripType: 'return',
                picture: 'test.photo.test',
                userId: '-MUyHJmKrxA90lPNQ1FOLNm'
              }
            ],
            meta: {
              count: {
                open: 1,
                past: 1,
              },
              pagination: {
                pageCount: 1,
                currentPage: 1,
                dataCount: 2,
              },
            },
          },
        };
        request(app)
          .get('/api/v1/requests')
          .set('authorization', token)
          .end((err, res) => {
            expect(res.body).toMatchObject(expectedResponse.body);
            expect(res.body.requests.length).toEqual(2);
            expect(res.body.requests[0]).toHaveProperty('travelCompletion');
            expect(res.body.requests[0].travelCompletion).toEqual('0% complete');
            done();
          });
      });
    it('should get travechecklist percentage as 50 for approved and 100 for verified request',
      async (done) => {
        const requestId = requests[0].id;
        try {
          const testRequest = await models.Request.findById(requestId);
          await testRequest.update({
            status: 'Approved'
          });
          await models.Trip.create(trips[2]);
        } catch (error) {
          return null;
        }

        request(app)
          .get('/api/v1/requests')
          .set('authorization', token)
          .end((err, res) => {
            expect(res.body.requests.length).toEqual(2);
            expect(res.body.requests[0]).toHaveProperty('travelCompletion');
            expect(res.body.requests[0].travelCompletion).toEqual('50% complete');
            expect(res.body.requests[1].travelCompletion).toEqual('100% complete');
            done();
          });
      });
  });
});
