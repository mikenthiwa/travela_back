/* eslint-disable */
import supertest from 'supertest';
import moxios from 'moxios';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import {
  userOgo,
  userOgoNotifications
} from './__mocks__/notificationsData';
import { role } from '../../userRole/__tests__/mocks/mockData';
import { dates } from '../../requests/__tests__/mocks/mockData';

const request = supertest;
const invalidToken =  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJpZCI6Ii1MSEptS3J4'; // eslint-disable-line

global.io = {
  sockets: {
    emit: (event, dataToBeEmitted) => dataToBeEmitted
  }
};

describe('Notifications Controller', () => {
  describe('GET /api/v1/notifications', () => {
    const payload = {
      UserInfo: {
        id: '-MUyHJmKrxA90lPNQ1FOLNm',
        name: 'Samuel Kubai',
        picture: 'fakePicture.png'
      },
    };

    const payload1 = {
      UserInfo: {
        id: '-MUyHJmKrxA90lPNOLNm',
        name: 'Optimum Price',
        picture: 'fakePicture.png'
      },
    };

    beforeAll(async () => {
      await models.Notification.truncate();
    });

    afterAll(async () => {
      await models.Notification.truncate();
    });

    const token = Utils.generateTestToken(payload);
    const token1 = Utils.generateTestToken(payload1);

    describe('Unauthenticated user', () => {
      it('should throw 401 error if the user does not provide a token',
        (done) => {
          const expectedResponse = {
            status: 401,
            body: {
              success: false,
              error: 'Please provide a token',
            },
          };

          request(app)
            .get('/api/v1/notifications')
            .end((err, res) => {
              expect(res).toMatchObject(expectedResponse);
              done();
            });
        });

      it("should throw 401 error if the user's provides an invalid token",
        (done) => {
          const expectedResponse = {
            status: 401,
            body: {
              success: false,
              error: 'Token is not valid',
            },
          };
          request(app)
            .get('/api/v1/notifications')
            .set('authorization', invalidToken)
            .end((err, res) => {
              expect(res).toMatchObject(expectedResponse);
              done();
            });
        });
    });

    describe('Authenticated user with no notifications', () => {
      it(`should return 200 status and the appropriate
      message for a user without notifications`, (done) => {
        const expectedResponse = {
          status: 404,
          body: {
            success: false,
            error: 'You have no notifications at the moment',
          }
        };
        request(app)
          .get('/api/v1/notifications')
          .set('authorization', token1)
          .end((err, res) => {
            expect(res.body).toMatchObject(expectedResponse.body);
            expect(res.body.error)
              .toEqual('You have no notifications at the moment');
            done();
          });
      });
    });

    describe('Authenticated user With notifications', () => {
      let notifications;
      beforeEach(async (done) => {
        const response = await models.Notification.create(
          {
            senderId: '-MUyH.JmKr0lPNQ1FOLNm',
            senderName: 'Test user B',
            senderImage: '/path/to/image',
            recipientId: '-MUyHJmKrxA90lPNOLNm',
            notificationType: 'pending',
            notificationStatus: 'unread',
            message: 'approved your request',
            requestId: 'xDh20cuGy',
            notificationLink: '/requests/link',
            createdAt: '2018-08-16T11:11:52.181Z',
            updatedAt: '2018-08-16T11:11:52.181Z',
          }
        );
        notifications = JSON.parse(JSON.stringify(response));
        done();
      });

      it('should return 200 status, and notifications', (done) => {
        const expectedResponse = {
          status: 200,
          body: {
            success: true,
            message: 'Notification retrieved successfully',
            notifications: [notifications],
          }
        };

        request(app)
          .get('/api/v1/notifications')
          .set('authorization', token1)
          .end((err, res) => {
            expect(res.body).toMatchObject(expectedResponse.body);
            expect(res.body.notifications.length).toEqual(1);
            done();
          });
      });
    });

    describe('Handle server errors', () => {
      beforeEach(async (done) => {
        await models.Notification.drop();
        done();
      });

      afterAll(async (done) => {
        await models.Notification.sync();
        done();
      });

      it('should return 500 status, and error message', (done) => {
        const expectedResponse = {
          status: 500,
          body: {
            success: false,
            error: 'Server Error'
          }
        };

        request(app)
          .get('/api/v1/notifications')
          .set('authorization', token)
          .end((err, res) => {
            expect(res.body).toMatchObject(expectedResponse.body);
            expect(res.body.notifications).toBe(undefined);
            done();
          });
      });
    });
  });

  describe('PUT /api/v1/notifications', () => {
    const payload = {
      UserInfo: {
        id: userOgo.userId,
        name: userOgo.fullName,
        picture: 'fakePicture.png'
      },
    };

    const userOgoToken = Utils.generateTestToken(payload);

    beforeAll(async () => {
      await models.Notification.truncate();
      await models.Notification.bulkCreate(userOgoNotifications);
    });

    afterAll(async () => {
      await models.Notification.truncate();
    });

    describe('Unauthenticated User', () => {
      it('should throw 401 error if user does not provide a token', (done) => {
        const expectedResponse = {
          status: 401,
          body: {
            success: false,
            error: 'Please provide a token',
          },
        };

        request(app)
          .put('/api/v1/notifications')
          .send({
            currentStatus: 'unread',
            newStatus: 'read',
            notificationType: 'pending'
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

      it('should throw 401 error if user provides an invalid token',
        (done) => {
          const expectedResponse = {
            status: 401,
            body: {
              success: false,
              error: 'Token is not valid'
            }
          };

          request(app)
            .put('/api/v1/notifications')
            .set('authorization', invalidToken)
            .send({
              currentStatus: 'unread',
              newStatus: 'read',
              notificationType: 'pending'
            })
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).toEqual(expectedResponse.status);
              expect(res.body).toMatchObject(expectedResponse.body);
              done();
            });
        });
    });

    describe('Authenticated user with wrong payload', () => {
      it('should return 422 if newStatus is a number', (done) => {
        const expectedResponse = {
          status: 422,
          body: {
            success: false,
            errors: [
              {
                message: 'newStatus must be "read"',
                name: 'newStatus'
              }
            ]
          },
        };

        request(app)
          .put('/api/v1/notifications')
          .set('authorization', userOgoToken)
          .send({
            currentStatus: 'unread',
            newStatus: '12345',
            notificationType: 'pending'
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

      it('should return 422 if newStatus is not `read`', (done) => {
        const expectedResponse = {
          status: 422,
          body: {
            success: false,
            errors: [
              {
                message: 'newStatus must be "read"',
                name: 'newStatus'
              }
            ]
          },
        };

        request(app)
          .put('/api/v1/notifications')
          .set('authorization', userOgoToken)
          .send({
            currentStatus: 'unread',
            newStatus: 'good',
            notificationType: 'pending'
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

      it('should return 422 if currentStatus is not `unread`', (done) => {
        const expectedResponse = {
          status: 422,
          body: {
            success: false,
            errors: [
              {
                message: 'currentStatus must be "unread"',
                name: 'currentStatus'
              }
            ]
          },
        };

        request(app)
          .put('/api/v1/notifications')
          .set('authorization', userOgoToken)
          .send({
            currentStatus: 'read',
            newStatus: 'read',
            notificationType: 'pending'
          })
          .end((err, res) => {
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

      it(`should return 422 if notificationType is
        neither pending nor general`, (done) => {
        const expectedResponse = {
          status: 422,
          body: {
            success: false,
            errors: [
              {
                message: 'notificationType can only be pending or general',
                name: 'notificationType'
              }
            ]
          },
        };

        request(app)
          .put('/api/v1/notifications')
          .set('authorization', userOgoToken)
          .send({
            currentStatus: 'unread',
            newStatus: 'read',
            notificationType: 'wrong'
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });

      it('should return 422 if payload doesn\'t have `newStatus` property',
        (done) => {
          const expectedResponse = {
            status: 422,
            body: {
              success: false,
              message: 'Validation failed',
              errors: [
                {
                  message: 'newStatus field is required',
                  name: 'newStatus'
                },
                {
                  message: 'newStatus must be "read"',
                  name: 'newStatus'
                }
              ]
            },
          };

          request(app)
            .put('/api/v1/notifications')
            .set('authorization', userOgoToken)
            .send({
              currentStatus: 'unread',
              notificationType: 'general'
            })
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).toEqual(expectedResponse.status);
              expect(res.body).toMatchObject(expectedResponse.body);
              done();
            });
        });

      it(`should return 422 if payload
          doesn't have "notificationType" property`,
      (done) => {
        const expectedResponse = {
          status: 422,
          body: {
            success: false,
            errors: [
              {
                message: 'notificationType field is required',
                name: 'notificationType'
              },
              {
                message: 'notificationType can only be pending or general',
                name: 'notificationType'
              },
            ]
          },
        };

        request(app)
          .put('/api/v1/notifications')
          .set('authorization', userOgoToken)
          .send({
            currentStatus: 'unread',
            newStatus: 'read'
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });
    });

    describe('Authenticated user with unread notifications', () => {
      it('should return 200 if notifications were successfully updated',
        (done) => {
          const expectedResponse = {
            status: 200,
            body: {
              success: true,
              message: 'All general notifications have been marked as read',
            },
          };

          request(app)
            .put('/api/v1/notifications')
            .set('authorization', userOgoToken)
            .send({
              currentStatus: 'unread',
              newStatus: 'read',
              notificationType: 'general'
            })
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).toEqual(expectedResponse.status);
              expect(res.body).toMatchObject(expectedResponse.body);
              done();
            });
        });
    });

    describe('Authenticated user with no unread notifications', () => {
      it('should throw 404 error if no unread notification', (done) => {
        const expectedResponse = {
          status: 404,
          body: {
            success: false,
            error: 'You have no general notifications at the moment'
          },
        };

        request(app)
          .put('/api/v1/notifications')
          .set('authorization', userOgoToken)
          .send({
            currentStatus: 'unread',
            newStatus: 'read',
            notificationType: 'general'
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(expectedResponse.status);
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });
    });

    describe('Handle server errors', () => {
      beforeAll(async (done) => {
        await models.Notification.drop();
        done();
      });

      afterAll(async (done) => {
        await models.Notification.sync();
        done();
      });

      it('should return 500 status, and error message', (done) => {
        const expectedResponse = {
          status: 500,
          body: {
            success: false,
            error: 'Server Error'
          }
        };

        request(app)
          .put('/api/v1/notifications')
          .set('authorization', userOgoToken)
          .send({
            currentStatus: 'unread',
            newStatus: 'read',
            notificationType: 'general'
          })
          .end((err, res) => {
            expect(res.body).toMatchObject(expectedResponse.body);
            done();
          });
      });
    });
  });

  describe('PUT /api/v1/notifications/id', () => {
    const payload = {
      UserInfo: {
        id: '-wonder-woman-',
        name: 'Wonder Woman',
        picture: 'wonderwoman.jpg'
      },
    };
    const notification = {
      id: 123,
      senderId: 'alice-doe-req-id',
      recipientId: '-wonder-woman-',
      notificationType: 'pending',
      message: 'created a new travel request',
      notificationLink: 'notify.com',
      notificationStatus: 'unread',
      senderName: 'Alice Doe',
      senderImage: 'image.com',
    };

    const token = Utils.generateTestToken(payload);
    beforeAll(async () => {
      const newRequest = {
        "name": "Alice Doe",
        "origin": "Kampala",
        "destination": "New yorker",
        "gender": "Male",
        "manager": "Ademola Ariya",
        "department": "TDD",
        "status" : "Open",
        "role": "Senior Consultant",
        "departureDate": "2018-08-16",
        "arrivalDate": "2018-08-30",
        "tripType": "oneWay",
        "trips": [
          {
            "origin": "Lagos",
            "destination": "Kenya",
            "departureDate": dates.departureDate
          }
        ],
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "id": "-wonder-woman-",
        "userId": "alice-doe-id",
        "picture": "picture.jpg"
      };
      await models.Request.create(newRequest);
      await models.Notification.create(notification);
    });

    afterAll(async () => {
      await models.Notification.sync({ force: true });
      await models.Request.sync({ force: true });
    });

    it('should return 401 for unathorized users', async () => {
      const expectedResponse = {
        status: 401,
        body: {
          success: false,
          error: 'Token is not valid',
        },
      };
      const res = await request(app)
        .put('/api/v1/notifications/123')
        .set('Authorization', 'invalid token')
      expect(res.statusCode).toEqual(expectedResponse.status);
      expect(res.body).toEqual(expectedResponse.body);
    });

    it('should not mark a notification that does not exist as read', async () => {
      const expectedResponse = {
        status: 404,
        body: {
          success: false,
          error: 'This notification does not exist',
        },
      };
      const res = await request(app)
        .put('/api/v1/notifications/1')
        .set('Authorization', token)
      expect(res.statusCode).toEqual(expectedResponse.status);
      expect(res.body).toEqual(expectedResponse.body);
    });

    it('should mark a notification as read', async () => {
      const expectedResponse = {
        status: 200,
        body: {
          success: true,
          message: 'Notification updated successfully',
          notification: { ...notification, notificationStatus: 'read' }
        },
      };
      const res = await request(app)
        .put('/api/v1/notifications/123')
        .set('Authorization', token)
      expect(res.statusCode).toEqual(expectedResponse.status);
      expect(res.body).toMatchObject(expectedResponse.body);
    });

    it('should not mark a read notification as read', async () => {
      const expectedResponse = {
        status: 409,
        body: {
          success: false,
          error: 'You\'ve already read this notification',
        },
      };
      const res = await request(app)
        .put('/api/v1/notifications/123')
        .set('Authorization', token)
      expect(res.statusCode).toEqual(expectedResponse.status);
      expect(res.body).toMatchObject(expectedResponse.body);
    });

    it('should check if notification id is an integer', async () => {
      const expectedResponse = {
        status: 422,
        body: {
          success: false,
          error: 'Notification id must be an integer',
        },
      };
      const res = await request(app)
        .put('/api/v1/notifications/demola')
        .set('Authorization', token)
      expect(res.statusCode).toEqual(expectedResponse.status);
      expect(res.body).toMatchObject(expectedResponse.body);
    });
  });

  describe('Comment replied by email', () => {
    const payload2 = {
      UserInfo: {
        id: '-MUyHJmKrdgd90lPNOLNm',
        fullName: 'Optimum Zeal',
        name: 'Optimum Zeal',
        picture: 'fake.png',
        email: 'fakeemail@andela.com'
      },
    };

    const repliedComment = {
      Subject: 'Re #-Bhjghdbfw#-MUyHJmKrdgd90lPNOLNm#-MUyHJmKrdgd90lPNOLNm',
      'stripped-text': 'I am replying from email from test environment'
    };

    const token2 = Utils.generateTestToken(payload2);
    beforeAll(async () => {
    moxios.install();
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await  models.Role.bulkCreate(role);
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=fakeemail@andela.com`, {
      status: 200,
      response: {
        values: [{
          bamboo_hr_id: '01',
        }]
      }
    });
    moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', '01'), {
      status: 200,
      response: {
        workEmail: 'lisa.doe@andela.com',
        supervisorEId: '92'
      }
    });
    moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', '92'), {
      status: 200,
      response: {
        id: '92',
        displayName: 'ssewilliam',
        firstName: 'William',
        lastName: 'Sserubiri',
        jobTitle: 'Engineering Team Lead',
        department: 'Partner-Programs',
        location: 'Kenya',
        workEmail: 'william.sserubiri@andela.com',
        supervisorEId: '9',
        supervisor: 'Samuel Kubai'
      }
    });
    moxios.stubRequest(`${process.env.ANDELA_PROD_API}/users?email=william.sserubiri@andela.com`, {
      status: 200,
      response: {
        values: [{
          email: 'william.sserubiri@andela.com',
          name: 'ssewilliam',
          id: '92',
          location: {
            name: 'Kampala'
          },
          picture: 'http//:gif.jpg'
        }]
      }
    });
    await request(app)
      .post('/api/v1/user')
      .set('authorization', token2)
      .send({ location: 'Lagos' });
    });

    afterAll(async () => {
      moxios.uninstall();
      await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
      await models.User.destroy({ force: true, truncate: { cascade: true } });
      await models.Role.destroy({ force: true, truncate: { cascade: true } });
      await models.Comment.destroy({ force: true, truncate: { cascade: true } });

    })

    xit('should post a replied comment from email', async (done) => {
        request(app)
        .post('/api/v1/email')
        .set('authorization', token2)
        .send(repliedComment)
        .end((err, res) => {
          const{ success, message, comment: {requestId} } = res.body;
          expect(success).toEqual(true);
          expect(message).toEqual('Comment created');
          expect(requestId).toEqual('-Bhjghdbfw');
          done();
        })
    })
  })
});
