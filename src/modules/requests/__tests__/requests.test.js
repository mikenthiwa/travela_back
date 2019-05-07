import supertest from 'supertest';
import moment from 'moment';
import models from '../../../database/models';
import app from '../../../app';
import { role as roles } from '../../userRole/__tests__/mocks/mockData';
import generateMock, { emptyRequestResponse, } from './mocks/mockData';
import Utils from '../../../helpers/Utils';
import RequestsController from '../RequestsController';
import UserRoleController from '../../userRole/UserRoleController';
import NotificationEngine from '../../notifications/NotificationEngine';
import TravelChecklistController from '../../travelChecklist/TravelChecklistController';
import ApprovalsController from '../../approvals/ApprovalsController';
import RequestUtils from '../RequestUtils';

const request = supertest;

global.io = {
  sockets: {
    emit: (event, dataToBeEmitted) => dataToBeEmitted,
  },
};

const mockAndelaOrigin = generateMock.center();
const mockAndelaDestination = generateMock.center({
  id: 2,
  location: 'Wakanda2'
});

const mockManager = generateMock.user(
  {
    id: 2,
    userId: 'saved-manager-1',
    passportName: 'Saved Manager',
    fullName: 'Saved Manager',
    picture: 'picture.png',
    email: 'saved.manager@andela.com',
    roleId: 53019,
    manager: null
  },
);

const mockTravelAdmin = generateMock.user(
  {
    fullName: 'Travel Admin',
    passportName: 'Travel Admin',
    department: 'Guest Relations & Travel',
    occupation: 'Travel Admin',
    roleId: 29187,
    email: 'travel.admin@andela.com',
    userId: 'travel-admin-1',
    location: 'Central City, Wakanda2',
    centerId: mockAndelaDestination.id,
    gender: 'Female',
    manager: null,
    id: 3
  }
);

const mockTravelTeamMember = generateMock.user({
  fullName: 'Travel Team Member',
  passportName: 'Travel Team Member',
  department: 'Guest Relations & Travel',
  occupation: 'Travel Team Member',
  email: 'travel.teamMember@gmail.com',
  userId: 'travel-team-member',
  location: mockAndelaOrigin.location,
  centerId: mockAndelaOrigin.id,
  manager: null,
  gender: 'Female',
  roleId: 339458,
  id: 4
});

const mockFinanceTeamMember = generateMock.user({
  fullName: 'Finance Team Member',
  passportName: 'Finance Team Member',
  department: 'Guest Relations & Travel',
  occupation: 'Finance Team Member',
  email: 'finance.teamMember@gmail.com',
  userId: 'finance-team-member',
  location: mockAndelaOrigin.location,
  centerId: mockAndelaOrigin.id,
  manager: null,
  gender: 'Female',
  roleId: 70001,
  id: 5
});

const mockRequester = generateMock.user({ manager: mockManager.fullName });

const mockNewRequest = generateMock.request(
  {
    manager: mockRequester.manager,
    id: undefined,
    department: 'Fellowship-Programs',
    trips: [
      generateMock.trip({
        destination: 'Central City, Wakanda2',
        id: undefined,
        requestId: undefined,
        departureDate: moment().add(2, 'days').format('YYYY-MM-DD'),
        returnDate: moment().add(4, 'days').format('YYYY-MM-DD'),
      })
    ],
    stipendBreakdown: [{
      subTotal: 600,
      location: 'New York, United States',
      dailyRate: 300,
      duration: 2,
      centerExists: true
    }],
    comments: {},
  }
);

const mockNewRequestWithComment = generateMock.request(
  {
    manager: mockRequester.manager,
    id: undefined,
    department: 'Fellowship-Programs',
    trips: [
      generateMock.trip({
        destination: 'Central City, Wakanda2',
        id: undefined,
        requestId: undefined,
        departureDate: moment().add(20, 'days').format('YYYY-MM-DD'),
        returnDate: moment().add(27, 'days').format('YYYY-MM-DD'),
      })
    ],
    stipendBreakdown: [{
      subTotal: 600,
      location: 'New York, United States',
      dailyRate: 300,
      duration: 2,
      centerExists: true
    }],
    comments: { comment: '<p>this is it</p>' },
  }
);

const fakeManager = generateMock.user(
  {
    id: '-MUyHJmKNQ1FOLNm',
    name: 'Oratorio Platimus',
    picture: 'fakePicture.png',
    roleId: 53019
  }
);

const nonExistentUserToken = Utils.generateTestToken({
  UserInfo: {
    email: 'dontexist@andela.com', id: 'hgyfytgcbvv', name: 'Incognito'
  }
});

const requesterToken = Utils.generateTestToken(
  { UserInfo: { ...mockRequester, name: mockRequester.fullName, id: mockRequester.userId } }
);

const savedManagerToken = Utils.generateTestToken({
  UserInfo: { ...mockManager, id: mockManager.userId, name: mockManager.fullName }
});

const travelTeamMemberToken = Utils.generateTestToken({
  UserInfo: {
    ...mockTravelTeamMember, id: mockTravelTeamMember.userId, name: mockTravelTeamMember.fullName
  }
});

const nonRequestManagerToken = Utils.generateTestToken({ UserInfo: fakeManager });

const invalidToken = 'eyJhbGciOiJSUzI1Ni6IkpXVCJ9.eyJVc2CI6Ii1MSEptS3J4';

const allUsers = [mockRequester, mockManager, mockTravelAdmin, mockTravelTeamMember, mockFinanceTeamMember];
const allUserRoles = allUsers.map(
  user => (
    {
      userId: user.id,
      roleId: user.roleId,
      centerId: user.centerId || null
    })
);

const mockDestinationGuestHouse = generateMock.guestHouse({
  location: 'Central City, Wakanda2',
  userId: mockTravelAdmin.userId,
});

const destinationMockRoom1 = generateMock.room();
const destinationMockRoom2 = generateMock.room({ roomName: 'Mock Room 2', id: 2 });
const destinationMockRoom3 = generateMock.room({ roomName: 'Mock Room 3', id: 3, faulty: true });

const allMockRooms = [destinationMockRoom1, destinationMockRoom2, destinationMockRoom3];

const destinationMockBed1 = generateMock.bed();
const destinationMockBed2 = generateMock.bed({ id: 2, bedName: 'bed 2' });
const destinationMockBed3 = generateMock.bed({ id: 3, roomId: destinationMockRoom2.id });
const destinationMockBed4 = generateMock.bed(
  { id: 4, bedName: 'bed 2', roomId: destinationMockRoom2.id }
);
const destinationMockBed5 = generateMock.bed(
  { id: 5, bedName: 'bed 1', roomId: destinationMockRoom3.id }
);
const destinationMockBed6 = generateMock.bed(
  { id: 6, bedName: 'bed 2', roomId: destinationMockRoom3.id }
);

const allMockBeds = [
  destinationMockBed1, destinationMockBed2, destinationMockBed3, destinationMockBed4,
  destinationMockBed5, destinationMockBed6
];

const mockOpenRequest = generateMock.request(
  {
    manager: mockRequester.manager,
    status: 'Open',
    userId: mockRequester.userId,
    department: 'Fellowship-Programs',
    id: 'mock-request-id-1',
    trips: [
      {
        ...generateMock.trip(
          {
            destination: 'Central City, Wakanda2',
            id: 'mock-trip-1',
            requestId: 'mock-request-id-1'
          }
        )
      }
    ],
    stipendBreakdown: JSON.stringify([{
      subTotal: 600,
      location: 'New York, United States',
      dailyRate: 300,
      duration: 2,
      centerExists: true
    }]),
  }
);

const mockApprovedRequest = generateMock.request(
  {
    manager: mockRequester.manager,
    status: 'Approved',
    userId: mockRequester.userId,
    department: 'Fellowship-Programs',
    id: 'mock-request-id-2',
    trips: [
      {
        ...generateMock.trip(
          {
            destination: 'Central City, Wakanda2',
            id: 'mock-trip-2',
            requestId: 'mock-request-id-2'
          }
        )
      }
    ],
    stipendBreakdown: JSON.stringify([{
      subTotal: 600,
      location: 'New York, United States',
      dailyRate: 300,
      duration: 2,
      centerExists: true
    }]),
  }
);

const mockRejectedRequest = generateMock.request(
  {
    manager: mockRequester.manager,
    status: 'Rejected',
    department: 'Fellowship-Programs',
    userId: mockRequester.userId,
    id: 'mock-request-id-3',
    trips: [
      {
        ...generateMock.trip(
          {
            destination: 'Central City, Wakanda2',
            id: 'mock-trip-3',
            requestId: 'mock-request-id-3'
          }
        )
      }
    ],
    stipendBreakdown: JSON.stringify([{
      subTotal: 600,
      location: 'New York, United States',
      dailyRate: 300,
      duration: 2,
      centerExists: true
    }]),
  }
);

const mockBookedBedRequest = generateMock.request(
  {
    manager: mockRequester.manager,
    userId: mockTravelAdmin.userId,
    gender: mockTravelAdmin.gender,
    department: 'Fellowship-Programs',
    id: 'mock-request-id-4',
    trips: [
      {
        ...generateMock.trip(
          {
            destination: 'Central City, Wakanda2',
            id: 'mock-trip-4',
            requestId: 'mock-request-id-4',
            bedId: 3,
            departureDate: moment().add(2, 'days').format('YYYY-MM-DD'),
            returnDate: moment().add(7, 'days').format('YYYY-MM-DD'),
          }
        )
      }
    ]
  }
);

const otherMockBookedBedRequest = generateMock.request(
  {
    manager: mockRequester.manager,
    userId: mockTravelAdmin.userId,
    gender: mockTravelAdmin.gender,
    department: 'Fellowship-Programs',
    id: 'mock-request-id-5',
    trips: [
      {
        ...generateMock.trip(
          {
            destination: 'Central City, Wakanda2',
            id: 'mock-trip-5',
            requestId: 'mock-request-id-5',
            bedId: 4,
            departureDate: moment().add(20, 'days').format('YYYY-MM-DD'),
            returnDate: moment().add(27, 'days').format('YYYY-MM-DD'),
          }
        )
      }
    ]
  }
);

const allMyApprovals = [mockOpenRequest, mockApprovedRequest, mockRejectedRequest].map(
  theRequest => ({
    requestId: theRequest.id,
    status: theRequest.status,
    approverId: theRequest.manager,
    budgetStatus: theRequest.status

  })
);


const DepartmentMock = [
  {
    id: 1,
    name: 'Success',
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  },
  {
    id: 2,
    name: 'Fellowship-Programs',
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  }
];

const UsersDepartmentsMock = [
  {
    id: 1,
    userId: 2,
    departmentId: 1,
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  },
  {
    id: 1,
    userId: 2,
    departmentId: 2,
    createdAt: '2019-03-18 13:00:31.182+01 ',
    updatedAt: '2019-03-18 13:00:31.182+01'
  }
];


describe('Requests Controller', () => {
  beforeAll(async (done) => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Bed.destroy({ force: true, truncate: { cascade: true } });
    await models.Room.destroy({ force: true, truncate: { cascade: true } });
    await models.GuestHouse.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Notification.truncate();
    await models.Comment.destroy({ force: true, truncate: { cascade: true } });

    await models.Center.bulkCreate([mockAndelaOrigin, mockAndelaDestination]);
    await models.Role.bulkCreate(roles);
    await models.User.bulkCreate(allUsers);

    await models.UserRole.bulkCreate(allUserRoles);
    await models.GuestHouse.create(mockDestinationGuestHouse);
    await models.Room.bulkCreate(allMockRooms);
    await models.Bed.bulkCreate(allMockBeds);
    await models.Department.bulkCreate(DepartmentMock);
    await models.UsersDepartments.bulkCreate(UsersDepartmentsMock);
    done();
  });

  afterAll(async (done) => {
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.UsersDepartments.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.Approval.destroy({ force: true, truncate: { cascade: true } });
    await models.Trip.destroy({ force: true, truncate: { cascade: true } });
    await models.Request.destroy({ force: true, truncate: { cascade: true } });
    await models.Notification.truncate();
    await models.Bed.destroy({ force: true, truncate: { cascade: true } });
    await models.Room.destroy({ force: true, truncate: { cascade: true } });
    await models.GuestHouse.destroy({ force: true, truncate: { cascade: true } });
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Comment.destroy({ force: true, truncate: { cascade: true } });
    await models.Department.destroy({ force: true, truncate: { cascade: true } });
    done();
  });

  describe('GET /api/v1/requests', () => {
    let requests;
    describe('Authenticated user with no requests', () => {
      it('should return 200 status and the appropriate message for a user without requests',
        (done) => {
          const expectedResponseBody = {
            success: true,
            requests: [],
            meta: {
              count: {
                open: 0,
                past: 0,
              },
              pagination: {
                pageCount: 0,
                currentPage: 1,
                dataCount: 0,
              },
            }
          };

          request(app)
            .get('/api/v1/requests')
            .set('authorization', requesterToken)
            .end((err, res) => {
              expect(res.status).toEqual(200);
              expect(res.body).toMatchObject(expectedResponseBody);
              expect(res.body.requests.length).toEqual(0);
              done();
            });
        });
    });

    describe('Authenticated user with requests', () => {
      beforeAll(async (done) => {
        await models.Trip.destroy({ force: true, truncate: { cascade: true } });
        await models.Approval.destroy({ force: true, truncate: { cascade: true } });
        await models.Request.destroy({ force: true, truncate: { cascade: true } });

        const response = await models.Request.bulkCreate(
          [
            { ...mockOpenRequest, name: 'User A', },
            { ...mockApprovedRequest, name: 'User B' },
            mockRejectedRequest
          ]
        );
        await models.Trip.bulkCreate(
          [
            ...mockOpenRequest.trips,
            ...mockApprovedRequest.trips,
            ...mockRejectedRequest.trips
          ]
        );

        requests = JSON.parse(JSON.stringify(response));
        done();
      });

      afterAll(async (done) => {
        await models.Trip.destroy({ force: true, truncate: { cascade: true } });
        await models.Approval.destroy({ force: true, truncate: { cascade: true } });
        await models.Request.destroy({ force: true, truncate: { cascade: true } });
        done();
      });

      it('should return 200 status, the requests and pagination data', (done) => {
        request(app)
          .get('/api/v1/requests')
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.requests.length).toEqual(3);
            done();
          });
      });

      it('should return 200 status and the requested number of requests when a limit query '
        + 'is provided', (done) => {
        request(app)
          .get('/api/v1/requests?limit=2')
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.requests).toHaveLength(2);
            done();
          });
      });

      it('should return 200 status and only open requests when the status query is set to "open"',
        (done) => {
          request(app)
            .get('/api/v1/requests?status=open')
            .set('Authorization', requesterToken)
            .end((err, res) => {
              expect(res.body.requests).toHaveLength(1);
              expect(res.status).toEqual(200);
              expect(res.body.requests[0].status).toEqual('Open');
              done();
            });
        });

      it('should return 200 status, and appropriate feedback if the user requests for a page that'
        + ' does not exist', (done) => {
        const expectedResponseBody = {
          message: 'No requests exists for this page',
          requests: [],
          meta: {
            count: {
              open: 1,
              past: 2,
            },
            pagination: {
              pageCount: 1,
              currentPage: 2,
              dataCount: 3,
            },
          },
        };

        request(app)
          .get('/api/v1/requests?limit=10&page=2')
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body).toMatchObject(expectedResponseBody);
            expect(res.body.requests.length).toEqual(0);
            done();
          });
      });

      it('should return 200 status and only approved and rejected requests when the status'
        + ' query is set to "past"', (done) => {
        request(app)
          .get('/api/v1/requests?status=past')
          .set('Authorization', requesterToken)
          .end((err, res) => {
            expect(res.body.requests).toHaveLength(2);
            expect(res.status).toEqual(200);
            done();
          });
      });

      it('should return 200 status code and matching response data if search match is found ',
        (done) => {
          const expectedResponse = {
            status: 200,
            body: {
              requests: requests.slice(0, 1),
              meta: {
                count: {
                  open: 1,
                  past: 0,
                },
                pagination: {
                  pageCount: 1,
                  currentPage: 1,
                  dataCount: 1,
                },
              },
              success: true,
            },
          };

          request(app)
            .get('/api/v1/requests?limit=2&search=user%20A')
            .set('authorization', requesterToken)
            .end((err, res) => {
              expect(res.body.requests).toHaveLength(1);
              expect(res).toMatchObject(expectedResponse);
              done();
            });
        });

      it('should return 200 status code and matching response data if search match is found and'
        + ' parameter is a status', (done) => {
        const expectedResponse = {
          status: 200,
          body: {
            requests: requests.slice(0, 1),
            meta: {
              count: {
                open: 1,
                past: 0,
              },
              pagination: {
                pageCount: 1,
                currentPage: 1,
                dataCount: 1,
              },
            },
            success: true,
          },
        };

        request(app)
          .get('/api/v1/requests?limit=2&search=open')
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res.body.requests).toHaveLength(1);
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

      it('should return 200 status code and paginated response if search parameter is capitalized',
        (done) => {
          const expectedResponse = {
            status: 200,
            body: {
              requests: requests.slice(1, 2),
              meta: {
                count: {
                  open: 0,
                  past: 1,
                },
                pagination: {
                  pageCount: 1,
                  currentPage: 1,
                  dataCount: 1,
                },
              },
              success: true,
            },
          };

          request(app)
            .get('/api/v1/requests?limit=2&search=USER%20B')
            .set('authorization', requesterToken)
            .end((err, res) => {
              expect(res.body.requests).toHaveLength(1);
              expect(res).toMatchObject(expectedResponse);
              done();
            });
        });

      it('should return 200 status code and response data if search parameter is empty',
        (done) => {
          const expectedResponse = {
            status: 200,
            body: {
              requests: [requests[0], requests[1]],
              meta: {
                count: {
                  open: 1,
                  past: 2,
                },
                pagination: {
                  pageCount: 2,
                  currentPage: 1,
                  dataCount: 3,
                },
              },
              success: true,
            },
          };

          request(app)
            .get('/api/v1/requests?limit=2&search=')
            .set('authorization', requesterToken)
            .end((err, res) => {
              expect(res.body.requests).toHaveLength(2);
              expect(res).toMatchObject(expectedResponse);
              done();
            });
        });

      it('should return proper status code and proper error message if no search result is found',
        (done) => {
          request(app)
            .get('/api/v1/requests?limit=2&status=open&search=xshdje')
            .set('authorization', requesterToken)
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.message).toBe('No records found');
              done();
            });
        });

      it('should throw 422 error if the status query is not open, approved, rejected or past',
        (done) => {
          const expectedResponse = {
            status: 422,
            body: {
              success: false,
              errors: [
                {
                  location: 'query',
                  param: 'status',
                  value: 'archive',
                  msg: 'Status must be "open", "past", "approved", "rejected" or "verified"',
                },
              ],
            },
          };

          request(app)
            .get('/api/v1/requests?status=archive')
            .set('authorization', requesterToken)
            .end((err, res) => {
              expect(res).toMatchObject(expectedResponse);
              done();
            });
        });

      it('should throw 422 error if the page query is not a positive integer', (done) => {
        const expectedResponse = {
          status: 422,
          body: {
            success: false,
            errors: [
              {
                location: 'query',
                param: 'page',
                value: '-100',
                msg: 'Page must be a positive integer',
              },
            ],
          },
        };

        request(app)
          .get('/api/v1/requests?page=-100')
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

      it('should throw 422 error if the limit query is not a positive integer', (done) => {
        const expectedResponse = {
          status: 422,
          body: {
            success: false,
            errors: [
              {
                location: 'query',
                param: 'limit',
                value: '-100',
                msg: 'Limit must be a positive integer',
              },
            ],
          },
        };

        request(app)
          .get('/api/v1/requests?limit=-100')
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });
    });

    describe('Unauthenticated user', () => {
      it('should throw 401 error if the user does not provide a token', (done) => {
        const expectedResponse = {
          status: 401,
          body: {
            success: false,
            error: 'Please provide a token',
          },
        };
        request(app)
          .get('/api/v1/requests')
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

      it('should throw 401 error if the user\'s provides an invalid token', (done) => {
        const expectedResponse = {
          status: 401,
          body: {
            success: false,
            error: 'Token is not valid',
          },
        };
        request(app)
          .get('/api/v1/requests')
          .set('authorization', invalidToken)
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });
    });
  });

  describe('POST /requests - Create New Request', () => {
    describe('Unauthenticated User', () => {
      it('should check if the token exists and return 401 if it does not', async (done) => {
        const res = await request(app)
          .post('/api/v1/requests')
          .send({
            name: 'demola',
          });
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Please provide a token');
        done();
      });

      it('should check if the token is valid and return 401 if it is not', async (done) => {
        const res = await request(app)
          .post('/api/v1/requests')
          .set('Authorization', invalidToken)
          .send({
            name: 'demola',
          });
        expect(res.status).toEqual(401);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Token is not valid');
        done();
      });
    });

    describe('Authenticated User', () => {
      // check that all the fields are filled - fail if any field is missing
      it('should return 422 if validation fails', async (done) => {
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send({});
        expect(res.status).toEqual(422);
        expect(res.body).toMatchObject(emptyRequestResponse);
        done();
      });

      //  create request if everything is fine
      it('should add a new request to the db', async (done) => {
        await models.Request.create(mockBookedBedRequest);
        await models.Trip.bulkCreate(mockBookedBedRequest.trips);
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send(mockNewRequest);
        expect(res.status).toEqual(201);
        done();
      });

      it('should add a new request with a comment to the db', async (done) => {
        await models.Request.create(otherMockBookedBedRequest);
        await models.Trip.bulkCreate(otherMockBookedBedRequest.trips);
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send(mockNewRequestWithComment);
        expect(res.status).toEqual(201);
        await models.Comment.destroy({ force: true, truncate: { cascade: true } });
        done();
      });

      it('should return 422 and stipendBreakDown must be an array error', async (done) => {
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send({
            ...mockNewRequest,
            stipendBreakdown: 'jhjsgvd'
          });
        expect(res.status).toEqual(422);
        expect(res.body.errors[0].msg).toEqual('stipendBreakdown must be an array');
        done();
      });

      it('should return 422 and missing subTotal error', async (done) => {
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send({
            ...mockNewRequest,
            stipendBreakdown: [{
              location: 'New York, United States',
              dailyRate: 300,
              duration: 2,
              centerExists: true
            }],
          });
        expect(res.status).toEqual(422);
        expect(res.body.errors[0].msg).toEqual('subTotal is missing for object at position 1');
        done();
      });

      it('should throw 422 error while creating a request that is not multi-trip with'
        + ' more than one trip', async (done) => {
        const expectedResponse = {
          body: {
            success: false,
            errors: [
              {
                location: 'body',
                param: 'trips',
                msg: 'A return trip must have one trip',
              },
            ],
          },
          status: 422,
        };
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send({
            ...mockNewRequest,
            trips: [...mockNewRequest.trips, ...mockNewRequest.trips],
          });
        expect(res).toMatchObject(expectedResponse);
        done();
      });

      it('should throw 422 error while creating a request with invalid date', async (done) => {
        const expectedResponse = {
          body: {
            success: false,
            errors: [
              {
                location: 'body',
                param: 'trips[0].returnDate',
                msg: 'Please specify a valid ISO return date',
              },
            ],
          },
          status: 422,
        };
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send({
            ...mockNewRequest,
            trips: [{ ...mockNewRequest.trips[0], returnDate: 'badDate' }],
          });
        expect(res).toMatchObject(expectedResponse);
        done();
      });

      it('should throw 422 error with invalid type for stipend', async (done) => {
        const expectedResponse = {
          body: {
            success: false,
            errors: [
              {
                location: 'body',
                param: 'stipend',
                msg: 'stipend must be an integer and not less than zero',
              },
            ],
          },
          status: 422,
        };
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send({
            ...mockNewRequest,
            stipend: 'one thousand',
            trips: [{ ...mockNewRequest.trips[0] }],
          });
        expect(res).toMatchObject(expectedResponse);
        done();
      });

      it('should throw 422 error while creating a request if the departureDate is less than'
        + ' the returnDate', async (done) => {
        const expectedResponse = {
          body: {
            success: false,
            errors: [
              {
                location: 'body',
                param: 'trips[0]',
                msg: 'returnDate must be greater than departureDate',
              },
            ],
          },
          status: 422,
        };
        const res = await request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send({
            ...mockNewRequest,
            trips: [
              {
                ...mockNewRequest.trips[0],
                departureDate: mockNewRequest.trips[0].returnDate,
                returnDate: mockNewRequest.trips[0].departureDate,
              }
            ],
          });
        expect(res).toMatchObject(expectedResponse);
        done();
      });

      it('should return error if bed id does not exist in any guesthouse when posting a request',
        async (done) => {
          request(app)
            .post('/api/v1/requests')
            .set('authorization', requesterToken)
            .send({
              ...mockNewRequest,
              trips: [
                {
                  ...mockNewRequest.trips[0],
                  bedId: 2340,
                }
              ]
            })
            .end((err, res) => {
              expect(res.status).toBe(400);
              expect(res.body.success).toEqual(false);
              expect(res.body.message).toEqual('A bed in this trip does not belong to its '
                + 'destination guesthouse');
              done();
            });
        });

      it('should return error if user books requests whose dates overlap', async (done) => {
        request(app)
          .post('/api/v1/requests')
          .set('authorization', requesterToken)
          .send(mockNewRequest)
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.error).toEqual('Sorry, you already have a request for these dates.');
            done();
          });
      });
    });
  }); // end of CREATE REQUEST API

  describe('Test suite for approval endpoints GET: api/v1/approvals', () => {
    it('should return 404 status code and message if search match is not found',
      (done) => {
        supertest(app)
          .get('/api/v1/approvals?status=open&search=qwert')
          .set('authorization', savedManagerToken)
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('No records found');
            done();
          });
      });

    it('should return 200 status code and matching response data if search match is found',
      (done) => {
        supertest(app)
          .get('/api/v1/approvals?page=1&status=open&search=test')
          .set('authorization', savedManagerToken)
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.approvals).toHaveLength(2);
            expect(res.body.message).toBe('Approvals retrieved successfully');
            done();
          });
      });

    it('should return 200 status code and response data if search parameter is empty',
      (done) => {
        supertest(app)
          .get('/api/v1/approvals?page=1&status=open&search=')
          .set('authorization', savedManagerToken)
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.approvals).toHaveLength(2);
            expect(res.body.message).toBe('Approvals retrieved successfully');
            done();
          });
      });
  });

  describe('Get an authenticated User Request detail', () => {
    let res;
    beforeAll(async (done) => {
      await models.Approval.destroy({ force: true, truncate: { cascade: true } });
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });

      await models.Request.create(mockOpenRequest);
      await models.Trip.bulkCreate(mockOpenRequest.trips);

      res = await request(app)
        .get(`/api/v1/requests/${mockOpenRequest.id}`)
        .set('authorization', requesterToken);
      done();
    });

    afterAll(async (done) => {
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Approval.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });
      done();
    });

    // it should get request details for a user
    it('should return request details of a user', async (done) => {
      expect(res.status).toBe(200);
      expect(res.body.requestData.id).toEqual(mockOpenRequest.id);
      done();
    });

    it('should return the expected number of trips', async (done) => {
      expect(res.body.requestData.trips).toHaveLength(mockOpenRequest.trips.length);
      done();
    });

    it('should return the correct type of the request', async (done) => {
      expect(res.body.requestData.tripType).toBe(mockOpenRequest.tripType);
      done();
    });

    it('should return a 404 ststus code for unexisting requestId', async (done) => {
      const response = await request(app)
        .get('/api/v1/requests/abcd')
        .set('authorization', requesterToken);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Request with id abcd does not exist',
        success: false,
      });
      done();
    });
  });

  describe('PUT /api/v1/requests/:requestId', () => {
    describe('Authenticated user', () => {
      const updateDetails = {
        ...mockOpenRequest,
        id: undefined,
        tripType: 'oneWay',
        trips: [
          {
            ...mockOpenRequest.trips[0],
            departureDate: moment().add(2, 'days').format('YYYY-MM-DD'),
            returnDate: null,
          }
        ],
      };
      beforeAll(async (done) => {
        await models.Comment.destroy({ force: true, truncate: { cascade: true } });
        await models.Approval.destroy({ force: true, truncate: { cascade: true } });
        await models.Trip.destroy({ force: true, truncate: { cascade: true } });
        await models.Request.destroy({ force: true, truncate: { cascade: true } });
        await models.Request.bulkCreate(
          [mockOpenRequest, mockApprovedRequest, mockRejectedRequest]
        );
        await models.Trip.bulkCreate(
          [
            ...mockOpenRequest.trips,
            ...mockApprovedRequest.trips,
            ...mockRejectedRequest.trips
          ]
        );
        await models.Approval.bulkCreate(allMyApprovals);
        done();
      });

      afterAll(async (done) => {
        await models.Comment.destroy({ force: true, truncate: { cascade: true } });
        await models.Trip.destroy({ force: true, truncate: { cascade: true } });
        await models.Approval.destroy({ force: true, truncate: { cascade: true } });
        await models.Request.destroy({ force: true, truncate: { cascade: true } });
        done();
      });

      it('should return error if bed id does not exist in any guesthouse when updating a request',
        (done) => {
          request(app)
            .put(`/api/v1/requests/${mockOpenRequest.id}`)
            .set('authorization', requesterToken)
            .send(
              {
                ...updateDetails,
                trips: [
                  {
                    ...updateDetails.trips[0],
                    bedId: 1234,
                  }
                ],
                stipendBreakdown: JSON.parse(updateDetails.stipendBreakdown)
              }
            )
            .end((err, res) => {
              expect(res.status).toBe(400);
              expect(res.body.success).toBe(false);
              expect(res.body.message).toBe('A bed in this trip does not belong to its '
                + 'destination guesthouse');
              done();
            });
        });

      it('should return 422 error if the user supplies empty fields', (done) => {
        const expectedResponse = {
          body: {
            ...emptyRequestResponse,
          },
          status: 422,
        };
        request(app)
          .put(`/api/v1/requests/${mockOpenRequest.id}`)
          .set('authorization', requesterToken)
          .send({})
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

      it('should return 409 error if the request has been approved or rejected', (done) => {
        const expectedResponse = {
          body: {
            success: false,
            error: 'Request could not be updated because it has been approved',
          },
          status: 409,
        };
        request(app)
          .put(`/api/v1/requests/${mockApprovedRequest.id}`)
          .set('authorization', requesterToken)
          .send({
            ...updateDetails,
            stipendBreakdown: JSON.parse(updateDetails.stipendBreakdown)
          })
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

      it('should return 404 error if the request does not exist', (done) => {
        const expectedResponse = {
          body: {
            success: false,
            error: 'Request was not found',
          },
          status: 404,
        };
        request(app)
          .put('/api/v1/requests/abcdef')
          .set('authorization', requesterToken)
          .send({
            ...updateDetails,
            stipendBreakdown: JSON.parse(updateDetails.stipendBreakdown)
          })
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

      it('should return 200 if a user tries to update a oneWay request with a returnDate',
        (done) => {
          const expectedResponse = {
            body: {
              success: true,
            },
            status: 200,
          };
          request(app)
            .put(`/api/v1/requests/${mockOpenRequest.id}`)
            .set('authorization', requesterToken)
            .send({
              ...updateDetails,
              trips: [
                {
                  ...updateDetails.trips[0],
                  returnDate: moment().add(4, 'days').format('YYYY-MM-DD'),
                }
              ],
              stipendBreakdown: JSON.parse(updateDetails.stipendBreakdown)
            })
            .end((err, res) => {
              expect(res).toMatchObject(expectedResponse);
              done();
            });
        });

      it('should return 422 error if a user tries to update a multi-trip request with only'
        + ' one trip',
      (done) => {
        const expectedResponse = {
          body: {
            success: false,
            errors: [
              {
                location: 'body',
                param: 'trips',
                msg: 'A multi trip must have more than one trip',
              },
            ],
          },
          status: 422,
        };
        request(app)
          .put('/api/v1/requests/xDh20cuGz')
          .set('authorization', requesterToken)
          .send({
            ...updateDetails,
            tripType: 'multi',
            trips: [
              {
                ...updateDetails.trips[0],
                returnDate: moment().add(4, 'days').format('YYYY-MM-DD'),
              }
            ],
            stipendBreakdown: JSON.parse(updateDetails.stipendBreakdown)
          })
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });

      it('should edit the request and return 200 and updated request', (done) => {
        request(app)
          .put(`/api/v1/requests/${mockOpenRequest.id}`)
          .set('authorization', requesterToken)
          .send({
            ...updateDetails,
            stipendBreakdown: JSON.parse(updateDetails.stipendBreakdown)
          })
          .end((err, res) => {
            expect(res.body.success).toEqual(true);
            expect(res.body.request.id).toEqual(mockOpenRequest.id);
            expect(res.body.request.tripType).toEqual('oneWay');
            expect(res.body.trips[0].id).toEqual(mockOpenRequest.trips[0].id);
            expect(res.body.trips[0].returnDate).toEqual(null);
            done();
          });
      });

      it('should not update trip if dates overlap', (done) => {
        request(app)
          .put('/api/v1/requests/abcd')
          .set('authorization', requesterToken)
          .send({
            ...updateDetails,
            stipendBreakdown: JSON.parse(updateDetails.stipendBreakdown)
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.error).toEqual('Sorry, you already have a request for these dates.');
            done();
          });
      });

      it('should update or create a new trip if it does not exist in the database', (done) => {
        const customUpdateDetails = {
          ...updateDetails,
          tripType: 'multi',
          trips: [
            {
              ...updateDetails.trips[0],
              returnDate: moment().add(4, 'days').format('YYYY-MM-DD'),
            },
            generateMock.trip({
              origin: 'Central City, Wakanda2',
              destination: 'Central City, Wakanda2',
              departureDate: moment().add(4, 'days').format('YYYY-MM-DD'),
              returnDate: moment().add(7, 'days').format('YYYY-MM-DD'),
              bedId: null,
              id: undefined,
              requestId: updateDetails.id,
            })
          ],
          stipendBreakdown: JSON.parse(updateDetails.stipendBreakdown)
        };
        request(app)
          .put(`/api/v1/requests/${mockOpenRequest.id}`)
          .set('authorization', requesterToken)
          .send(customUpdateDetails)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.trips).toHaveLength(2);
            expect(res.body.trips[0].id).toEqual(mockOpenRequest.trips[0].id);
            expect(res.body.trips[1].id).not.toEqual(mockOpenRequest.trips[0].id);
            done();
          });
      });
    });

    describe('Unauthenticated user', () => {
      it('should throw 401 error if token is not valid', (done) => {
        request(app)
          .put('/api/v1/requests/xDh20cuGz')
          .set('authorization', invalidToken)
          .send({
            name: 'Grace John',
          })
          .end((err, res) => {
            expect(res).toMatchObject({
              body: {
                success: false,
                error: 'Token is not valid',
              },
              status: 401,
            });
            done();
          });
      });
      it('should throw 401 error if token is not provided', (done) => {
        request(app)
          .put('/api/v1/requests/xDh20cuGz')
          .send({
            name: 'Grace John',
          })
          .end((err, res) => {
            expect(res).toMatchObject({
              body: {
                success: false,
                error: 'Please provide a token',
              },
              status: 401,
            });
            done();
          });
      });
    });
  });

  describe('PUT /approvals/:requestId - Update Request Status', () => {
    beforeAll(async (done) => {
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });
      await models.Approval.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });

      await models.Request.bulkCreate([
        mockOpenRequest,
        mockApprovedRequest,
        mockRejectedRequest
      ]);
      await models.Trip.bulkCreate(
        [
          ...mockOpenRequest.trips,
          ...mockApprovedRequest.trips,
          ...mockRejectedRequest.trips
        ]
      );
      await models.Approval.bulkCreate(allMyApprovals);
      done();
    });

    afterAll(async (done) => {
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });
      await models.Approval.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });
      done();
    });

    describe('Not Requester\'s Manager', () => {
      it('should return an error message', async (done) => {
        const res = await request(app)
          .put(`/api/v1/approvals/${mockOpenRequest.id}`)
          .set('authorization', nonRequestManagerToken)
          .send({ newStatus: 'Rejected' });
        expect(res.status).toBe(403);
        expect(res.body).toMatchObject({
          success: false,
          error: 'Permission denied, you are not requesters manager',
        });
        done();
      });

      it('should return 404 error if the user does not exist in the app', (done) => {
        const expectedResponse = {
          body: {
            success: false,
            error: 'User does not exist in the application',
          },
          status: 404,
        };
        request(app)
          .put(`/api/v1/approvals/${mockOpenRequest.id}`)
          .set('authorization', nonExistentUserToken)
          .send({ newStatus: 'Approved' })
          .end((err, res) => {
            expect(res).toMatchObject(expectedResponse);
            done();
          });
      });
    });

    describe('Requesters Manager', () => {
      ApprovalsController.sendNotificationToTravelAdmin = jest.fn();
      it('should successfully update a requests status', async (done) => {
        const res = await request(app)
          .put(`/api/v1/approvals/${mockOpenRequest.id}`)
          .set('authorization', savedManagerToken)
          .send({ newStatus: 'Approved' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(ApprovalsController.sendNotificationToTravelAdmin).toHaveBeenCalled();
        expect(res.body.message).toEqual('Request approved successfully');
        done();
      });

      it('should not update a requests status twice', async (done) => {
        const res = await request(app)
          .put(`/api/v1/approvals/${mockOpenRequest.id}`)
          .set('authorization', savedManagerToken)
          .send({ newStatus: 'Approved' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Request has been approved already');
        done();
      });

      it('should return request details of a user', async (done) => {
        const res = await request(app)
          .get(`/api/v1/requests/${mockOpenRequest.id}`)
          .set('authorization', requesterToken);
        done();
        expect(res.status).toBe(200);
        expect(res.body.requestData.id).toEqual(mockOpenRequest.id);
        done();
      });

      it('should throw validation error when newStatus does not match expected input',
        async (done) => {
          const res = await request(app)
            .put(`/api/v1/approvals/${mockOpenRequest.id}`)
            .set('authorization', savedManagerToken)
            .send({ newStatus: 'ApprovedRejected' });
          expect(res.statusCode).toEqual(422);
          done();
        });

      it('should return an error if request is not found', async (done) => {
        const res = await request(app)
          .put('/api/v1/approvals/abcd')
          .set('authorization', savedManagerToken)
          .send({ newStatus: 'Approved' });
        expect(res.statusCode).toEqual(404);
        expect(res.body.success).toEqual(false);
        done();
      });

      it('should return an error message if approval does not exist', async (done) => {
        await models.Approval.destroy({ where: { requestId: mockOpenRequest.id } });
        const res = await request(app)
          .put(`/api/v1/approvals/${mockOpenRequest.id}`)
          .set('authorization', savedManagerToken)
          .send({ newStatus: 'Rejected' });
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
          success: false,
          error: 'Request not found',
        });
        done();
      });
    });

    describe('Unauthenticated User', () => {
      it('should check if the token exists and return 401 if it does not', async (done) => {
        const res = await request(app)
          .put('/api/v1/approvals/xDh20cuT0')
          .send({ newStatus: 'Rejected' });
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Please provide a token');
        done();
      });

      it('should check if the token is valid and return 401 if it is not', async (done) => {
        const res = await request(app)
          .put('/api/v1/approvals/xDh20cuT0')
          .set('Authorization', invalidToken)
          .send({ newStatus: 'Approved' });
        expect(res.status).toEqual(401);
        expect(res.body.success).toEqual(false);
        expect(res.body.error).toEqual('Token is not valid');
        done();
      });
    });
  });// end of REQUEST STATUS UPDATE

  describe('My verifications', () => {
    beforeAll(async (done) => {
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Approval.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });

      await models.Request.bulkCreate(
        [mockOpenRequest, mockApprovedRequest, mockRejectedRequest]
      );
      await models.Trip.bulkCreate(
        [
          ...mockOpenRequest.trips,
          ...mockRejectedRequest.trips
        ]
      );

      await models.Approval.bulkCreate(allMyApprovals);
      done();
    });

    afterAll(async (done) => {
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });
      await models.Approval.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });
      done();
    });

    describe('PUT /api/v1/requests/:requestId/verify', () => {
      afterAll(async (done) => {
        await models.Comment.destroy({ force: true, truncate: { cascade: true } });
        await models.Approval.destroy({ force: true, truncate: { cascade: true } });
        await models.Trip.destroy({ force: true, truncate: { cascade: true } });
        await models.Request.destroy({ force: true, truncate: { cascade: true } });
        done();
      });

      it('validates that the request status is approved', (done) => {
        request(app)
          .put(`/api/v1/requests/${mockOpenRequest.id}/verify`)
          .set('authorization', travelTeamMemberToken)
          .send({})
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toBe('This request cannot be updated');
            done();
          });
      });

      it('validates that trips exists for the request', (done) => {
        request(app)
          .put(`/api/v1/requests/${mockApprovedRequest.id}/verify`)
          .set('authorization', travelTeamMemberToken)
          .send({})
          .end((err, res) => {
            expect(res.status).toBe(404);
            expect(res.body.success).toEqual(false);
            expect(res.body.error).toBe('No trip exists for this request');
            done();
          });
      });

      it('validates that the departureDate is not passed', async (done) => {
        await models.Trip.create({
          ...mockApprovedRequest.trips[0],
        });
        request(app)
          .put(`/api/v1/requests/${mockApprovedRequest.id}/verify`)
          .set('authorization', travelTeamMemberToken)
          .send({})
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toBe('Departure date for a trip in this request has passed');
            done();
          });
      });

      it('validates that user is a travel team member of the request\'s first trip origin',
        async (done) => {
          await models.Trip.destroy({
            where: { id: mockApprovedRequest.trips[0].id },
            force: true
          });
          await models.Trip.create({
            ...mockApprovedRequest.trips[0],
            origin: 'Central City, Wakanda2',
            departureDate: moment().add(2, 'days').format('YYYY-MM-DD'),
            returnDate: moment().add(4, 'days').format('YYYY-MM-DD'),
          });
          request(app)
            .put(`/api/v1/requests/${mockApprovedRequest.id}/verify`)
            .set('authorization', travelTeamMemberToken)
            .send({})
            .end((err, res) => {
              expect(res.status).toBe(403);
              expect(res.body.success).toEqual(false);
              expect(res.body.error).toBe('You can only verify a request that has the same origin as one of your assigned locations');
              done();
            });
        });

      it('validates that user is a travel team member or admin', async (done) => {
        request(app)
          .put(`/api/v1/requests/${mockApprovedRequest.id}/verify`)
          .set('authorization', requesterToken)
          .send({})
          .end((err, res) => {
            expect(res.status).toBe(403);
            expect(res.body.success).toEqual(false);
            expect(res.body.error).toBe('You don\'t have access to perform this action');
            done();
          });
      });

      it('validates that the checklist percentage is complete', async (done) => {
        await models.Trip.destroy({
          where: { id: mockApprovedRequest.trips[0].id },
          force: true
        });
        await models.Trip.create({
          ...mockApprovedRequest.trips[0],
          departureDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          returnDate: moment().add(4, 'days').format('YYYY-MM-DD'),
        });
        request(app)
          .put(`/api/v1/requests/${mockApprovedRequest.id}/verify`)
          .set('authorization', travelTeamMemberToken)
          .send({})
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(res.body.success).toEqual(false);
            expect(res.body.message).toBe('The checklist submission is yet to be completed');
            done();
          });
      });

      it('should return not found if request does not exist', (done) => {
        request(app)
          .put('/api/v1/requests/abcd/verify')
          .set('authorization', travelTeamMemberToken)
          .send({})
          .end((err, res) => {
            expect(res.status).toBe(404);
            expect(res.body.success).toEqual(false);
            expect(res.body.error).toBe('No trip exists for this request');
            done();
          });
      });

      it('updates the status of a request to "Verified"', (done) => {
        TravelChecklistController.checkListPercentageNumber = jest.fn().mockImplementationOnce(
          () => 100
        );
        jest.spyOn(RequestUtils, 'sendEmailToFinanceTeam');
        NotificationEngine.sendMailToMany = jest.fn();
        const redirect = 'redirect/requests/mock-request-id-2';
        const notifySpy = jest.spyOn(NotificationEngine, 'notify');
        const sendMailSpy = jest.spyOn(NotificationEngine, 'sendMail');
        request(app)
          .put(`/api/v1/requests/${mockApprovedRequest.id}/verify`)
          .set('authorization', travelTeamMemberToken)
          .send({})
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.success).toEqual(true);
            expect(res.body.updatedRequest.request.status).toBe('Verified');
            expect(notifySpy).toHaveBeenCalled();
            expect(sendMailSpy).toHaveBeenCalledWith({
              recipient: {
                email: 'test.user1@gmail.com',
                name: 'Test User 1'
              },
              redirectLink: `${process.env.REDIRECT_URL}/${redirect}`,
              requestId: 'mock-request-id-2',
              sender: 'Travel Team Member',
              topic: 'Travel Request Verified',
              type: 'Verified'
            });
            const [args] = NotificationEngine.notify.mock.calls[
              NotificationEngine.notify.mock.calls.length - 1
            ];
            expect(args.notificationType).toEqual('general');
            if (err) return done(err);
            expect(
              RequestUtils.sendEmailToFinanceTeam
            ).toHaveBeenCalled();
            done();
          });
      });
    });

    describe('GET /api/v1/approvals - VERIFICATION', () => {
      beforeAll(async (done) => {
        await models.Comment.destroy({ force: true, truncate: { cascade: true } });
        await models.Trip.destroy({ force: true, truncate: { cascade: true } });
        await models.Approval.destroy({ force: true, truncate: { cascade: true } });
        await models.Request.destroy({ force: true, truncate: { cascade: true } });
        await models.Request.bulkCreate(
          [mockOpenRequest, mockApprovedRequest, mockRejectedRequest]
            .map(req => ({ ...req, budgetStatus: 'Approved' }))
        );
        await models.Trip.bulkCreate(
          [
            ...mockOpenRequest.trips,
            ...mockRejectedRequest.trips,
            {
              ...mockApprovedRequest.trips[0],
              departureDate: moment().add(2, 'days').format('YYYY-MM-DD'),
              returnDate: moment().add(4, 'days').format('YYYY-MM-DD'),
            }
          ]
        );
        await models.Approval.bulkCreate(allMyApprovals.map(req => ({
          ...req,
          budgetStatus: 'Approved'
        })));
        done();
      });
      it('should require a travel team member', (done) => {
        request(app)
          .get('/api/v1/approvals')
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res.status).toBe(403);
            expect(res.body.success).toEqual(false);
            expect(res.body.error).toBe('You don\'t have access to perform this action');
            done();
          });
      });

      it('should return requests when searching for approved requests', (done) => {
        request(app)
          .get('/api/v1/approvals?verified=true&status=approved')
          .set('authorization', travelTeamMemberToken)
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.success).toEqual(true);
            done();
          });
      });

      it('should return requests from travel team member\'s origin', (done) => {
        request(app)
          .get('/api/v1/approvals?verified=true')
          .set('authorization', travelTeamMemberToken)
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.success).toEqual(true);
            done();
          });
      });

      it('should return requests when searching for verified requests', async (done) => {
        await models.Trip.destroy({
          where: { requestId: mockApprovedRequest.id },
          force: true
        });
        await models.Approval.destroy({
          where: { requestId: mockApprovedRequest.id },
          force: true
        });
        await models.Request.destroy({
          where: { id: mockApprovedRequest.id },
          force: true
        });

        await models.Request.create({
          ...mockApprovedRequest,
          status: 'Verified',
          budgetStatus: 'Approved',
        });
        await models.Trip.create({
          ...mockApprovedRequest.trips[0],
          departureDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          returnDate: moment().add(4, 'days').format('YYYY-MM-DD'),
        });
        await models.Approval.create({
          requestId: mockApprovedRequest.id,
          status: 'Verified',
          budgetStatus: 'Approved',
          approverId: mockTravelTeamMember.fullName,
        });

        request(app)
          .get('/api/v1/approvals?verified=true&status=verified')
          .set('authorization', travelTeamMemberToken)
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.success).toEqual(true);
            done();
          });
      });
    });
  });

  describe('RequestController.sendNotificationToAdmin', () => {
    beforeAll(() => {
      NotificationEngine.notifyMany = jest.fn();
      NotificationEngine.sendMailToMany = jest.fn();
    });

    it('should send "general" notification if mailType is "New Request"',
      async (done) => {
        const {
          req, trips, travelRequest, message, mailTopic, mailType
        } = generateMock.mailData('New Request');
        await RequestsController.sendNotificationToTravelAdmin(
          req, trips, travelRequest, message, mailTopic, mailType,
        );
        const [args] = NotificationEngine
          .notify.mock.calls[NotificationEngine.notifyMany.mock.calls.length - 1];
        expect(args.notificationType).toEqual('general');
        done();
      });
  });

  // Tests to capture the sendNotificationToManager method
  describe('RequestController.sendNotificationToManager', () => {
    beforeAll(() => {
      // mock the modules and functions that will cause side-effects
      UserRoleController.getRecipient = jest.fn()
        .mockReturnValue({ userId: '00023' });
      NotificationEngine.notify = jest.fn();
      NotificationEngine.sendMail = jest.fn();
    });

    it('should send "pending" notification if mailType is "New Request"',
      async (done) => {
        const {
          req, res, travelRequest, message, mailTopic, mailType
        } = generateMock.mailData('New Request');
        await RequestsController.sendNotificationToManager(
          req, res, travelRequest, message, mailTopic, mailType
        );
        const [args] = NotificationEngine
          .notify.mock.calls[NotificationEngine.notify.mock.calls.length - 1];
        expect(args.notificationType).toEqual('pending');
        done();
      });

    it('should send "general" notification if mailType is "Updated Request"',
      async (done) => {
        // generate the mock data and call the function
        const {
          req, res, travelRequest, message, mailTopic, mailType
        } = generateMock.mailData('Updated Request');
        await RequestsController.sendNotificationToManager(
          req, res, travelRequest, message, mailTopic, mailType
        );

        // get the arguments that NotificationEngine.notify was called with last
        const [args] = NotificationEngine
          .notify.mock.calls[NotificationEngine.notify.mock.calls.length - 1];
        expect(args.notificationType).toEqual('general');
        done();
      });

    it('should send "delete" notification if mailType is "Deleted Request"',
      async (done) => {
        // generate the mock data and call the function
        const {
          req, res, travelRequest, message, mailTopic, mailType
        } = generateMock.mailData('Deleted Request');
        await RequestsController.sendNotificationToManager(
          req, res, travelRequest, message, mailTopic, mailType
        );

        // get the arguments that NotificationEngine.notify was called with last
        const [args] = NotificationEngine
          .notify.mock.calls[NotificationEngine.notify.mock.calls.length - 1];
        expect(args.notificationType).toEqual('general');
        done();
      });

    it('should default to sending "general" notification if '
      + 'mailType is not given',
    async (done) => {
      // generate the mock data and call the function
      const {
        req, res, travelRequest, message, mailTopic, mailType
      } = generateMock.mailData(undefined);
      await RequestsController.sendNotificationToManager(
        req, res, travelRequest, message, mailTopic, mailType
      );

      // get the arguments that NotificationEngine.notify was called with last
      const [args] = NotificationEngine
        .notify.mock.calls[NotificationEngine.notify.mock.calls.length - 1];
      expect(args.notificationType).toEqual('general');
      done();
    });
  });

  describe('DELETE /api/v1/requests/:requestId', () => {
    beforeAll(async (done) => {
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });
      await models.Approval.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });

      await models.Request.bulkCreate([
        mockOpenRequest,
        mockApprovedRequest,
        mockRejectedRequest
      ]);
      await models.Trip.bulkCreate(
        [
          ...mockOpenRequest.trips,
          ...mockApprovedRequest.trips,
          ...mockRejectedRequest.trips
        ]
      );
      done();
    });

    afterAll(async (done) => {
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });
      await models.Trip.destroy({ force: true, truncate: { cascade: true } });
      await models.Approval.destroy({ force: true, truncate: { cascade: true } });
      await models.Request.destroy({ force: true, truncate: { cascade: true } });
      done();
    });

    describe('RequestController.sendNotificationToRequester', () => {
      beforeAll(() => {
        UserRoleController.getRecipient = jest.fn()
          .mockReturnValue({ userId: '00023' });
        NotificationEngine.sendMail = jest.fn();
      });

      it('should send email notification to user when the request is created.',
        async (done) => {
          const {
            req, res, travelRequest, message, mailTopic
          } = generateMock.mailData('New Request');

          await RequestsController.sendNotificationToRequester(
            req, res, travelRequest, message, mailTopic, 'New Requester Request'
          );
          expect(NotificationEngine.sendMail).toHaveBeenCalled();
          done();
        });
    });

    describe('An authenticated user', () => {
      it('should delete the request and return 200 ', async (done) => {
        request(app)
          .delete(`/api/v1/requests/${mockOpenRequest.id}`)
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res.status).toEqual(200);
            expect(res.body.success).toEqual(true);
            expect(res.body.message).toEqual(
              `Request ${mockOpenRequest.id} has been successfully deleted`
            );
            done();
          });
      });

      it('should return 409 error if the request has been approved or rejected',
        (done) => {
          request(app)
            .delete(`/api/v1/requests/${mockApprovedRequest.id}`)
            .set('authorization', requesterToken)
            .end((err, res) => {
              expect(res.body.error).toBe('Request is already approved');
              expect(res.status).toBe(409);
              done();
            });
        });

      it('should return 404 error if the request does not exist', (done) => {
        request(app)
          .delete('/api/v1/requests/abcd')
          .set('authorization', requesterToken)
          .end((err, res) => {
            expect(res.body.error).toBe('Request was not found');
            expect(res.status).toBe(404);
            done();
          });
      });
    });
  });
});
