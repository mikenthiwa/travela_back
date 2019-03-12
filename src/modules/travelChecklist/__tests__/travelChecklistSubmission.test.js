/* eslint-disable */
import supertest from 'supertest';
import models from '../../../database/models';
import app from '../../../app';
import Utils from '../../../helpers/Utils';
import {
	checklistSubmission, checklist, requestMock,
	tripsMock, bedData, roomData, guestHouse, userData
} from './mocks/mockData';
import TravelChecklistController from "../TravelChecklistController";

class Error {
	static handleError(error) {
		return error;
	}
}

const requesterPayload = {
	UserInfo: {
		id: '-AVwHJmKrxA90lPNQ1FOLNn',
		fullName: 'Mark Marcus',
		email: 'mark.marcus@andela.com',
		name: 'Mark',
		picture: '',
		userId: '-AVwHJmKrxA90lPNQ1FOLNn'
	},
};

const request = supertest(app);
const token = Utils.generateTestToken(requesterPayload);

describe('Travel Checklist Submission', () => {
	describe('POST submissions', () => {
		beforeAll(async () => {
			await models.Bed.sync({ force: true });
			await models.Room.sync({ force: true });
			await models.GuestHouse
				.destroy({ force: true, truncate: { cascade: true } });
			await models.ChecklistSubmission
				.destroy({ force: true, truncate: { cascade: true } });
			await models.ChecklistItem.sync({ force: true });
			await models.Request.destroy({ force: true, truncate: { cascade: true } });
			await models.Trip.sync({ force: true });
			await models.User.sync({ force: true, truncate: { cascade: true } });

			await models.User.create(userData)
			await models.GuestHouse.create(guestHouse)
			await models.Request.bulkCreate(requestMock);
			await models.Room.create(roomData)
			await models.Bed.bulkCreate(bedData)
			await models.Trip.bulkCreate(tripsMock)
			await models.ChecklistItem.create(checklist)
			await models.ChecklistSubmission.create(checklistSubmission)
		})

		afterAll(async () => {
			await models.Bed.sync({ force: true });
			await models.Room.sync({ force: true });
			await models.GuestHouse
				.destroy({ force: true, truncate: { cascade: true } });
			await models.ChecklistSubmission
				.destroy({ force: true, truncate: { cascade: true } });
			await models.ChecklistItem.sync({ force: true });
			await models.Request.destroy({ force: true, truncate: { cascade: true } });
			await models.Trip.sync({ force: true });
			await models.User.destroy({ force: true, truncate: { cascade: true } });
		})

		it('should return 400 error if no tripId or file',
			(done) => {
				request
					.post('/api/v1/checklists/35678/submissions/46664')
					.set('Content-Type', 'application/json')
					.set('authorization', token)
					.send({})
					.end((err, res) => {
						if (err) return done(err);
						const msg = 'tripId and file are required';
						expect(res.status).toEqual(400);
						expect(res.body.success).toEqual(false);
						expect(res.body.error).toEqual(msg);
						done();
					});
			});

		it('should return 400 error if no tripId',
			(done) => {
				request
					.post('/api/v1/checklists/35678/submissions/46664')
					.set('Content-Type', 'application/json')
					.set('authorization', token)
					.send({ file: "N4000" })
					.end((err, res) => {
						if (err) return done(err);
						const msg = 'tripId is required';
						expect(res.status).toEqual(400);
						expect(res.body.success).toEqual(false);
						expect(res.body.error).toEqual(msg);
						done();
					});
			});

		it('should return 400 error if no tripId', (done) => {
			request
				.post('/api/v1/checklists/35678/submissions/46664')
				.set('Content-Type', 'application/json')
				.set('authorization', token)
				.send({ tripId: 'trip-13' })
				.end((err, res) => {
					if (err) return done(err);
					expect(res.status).toEqual(400);
					expect(res.body.success).toEqual(false);
					expect(res.body.error)
						.toEqual('file is required');
					done();
				});
		});

		it('should return 404 error if trip do not belong to the request',
			(done) => {
				request
					.post('/api/v1/checklists/35678/submissions/46664')
					.set('Content-Type', 'application/json')
					.set('authorization', token)
					.send({
						tripId: 'trip-13',
						file: "N4000"
					})
					.end((err, res) => {
						if (err) return done(err);
						expect(res.status).toEqual(404);
						expect(res.body.success).toEqual(false);
						expect(res.body.error)
							.toEqual('The trip does not exist for this request or user');
						done();
					});
			});

		it('should return 400 error if request is not approved', (done) => {
			request
				.post('/api/v1/checklists/99999/submissions/46664')
				.set('Content-Type', 'application/json')
				.set('authorization', token)
				.send({
					tripId: 'trip-13',
					file: "N4000"
				})
				.end((err, res) => {
					if (err) return done(err);
					expect(res.status).toEqual(400);
					expect(res.body.success).toEqual(false);
					expect(res.body.error)
						.toEqual('The request for this trip have not been approved');
					done();
				});
		});

		it(`should return 404 error if checklist item do not exist \
		for the trip's destination`, (done) => {
				request
					.post('/api/v1/checklists/35678/submissions/111')
					.set('Content-Type', 'application/json')
					.set('authorization', token)
					.send({
						tripId: 'trip-12',
						file: "N4000"
					})
					.end((err, res) => {
						if (err) return done(err);
						const msg = 'This checklist Item does not exist for this destination';
						expect(res.status).toEqual(404);
						expect(res.body.success).toEqual(false);
						expect(res.body.error).toEqual(msg);
						done();
					});
			});

		it('should submit file for a trip', (done) => {
			TravelChecklistController.sendEmailToTravelAdmin = jest.fn();
			let count = 0;
			jest.resetAllMocks();
			TravelChecklistController.checkListPercentageNumber = jest.fn(() => {
				count++;
				if (count === 1) {
					return 50;
				} else {
					return 100;
				}
			});
			request
				.post('/api/v1/checklists/35678/submissions/46664')
				.set('Content-Type', 'application/json')
				.set('authorization', token)
				.send({
					tripId: 'trip-12',
					file: "N4000"
				})
				.end((err, res) => {
					if (err) return done(err);
					expect(res.status).toEqual(201);
					expect(res.body.success).toEqual(true);
					expect(res.body.message)
						.toEqual('Submission uploaded successfully');
					expect(TravelChecklistController.sendEmailToTravelAdmin).toHaveBeenCalled();
					done();
				});
		});
	});

	describe('GET checklist submission', () => {
		beforeAll(async () => {
			await models.Bed.sync({ force: true });
			await models.Room.sync({ force: true });
			await models.GuestHouse
				.destroy({ force: true, truncate: { cascade: true } });
			await models.ChecklistSubmission
				.destroy({ force: true, truncate: { cascade: true } });
			await models.ChecklistItem.sync({ force: true });
			await models.Request.destroy({ force: true, truncate: { cascade: true } });
			await models.Trip.sync({ force: true });
			await models.User.destroy({ force: true, truncate: { cascade: true } });

			await models.User.create(userData)
			await models.GuestHouse.create(guestHouse)
			await models.Request.bulkCreate(requestMock);
			await models.Room.create(roomData)
			await models.Bed.bulkCreate(bedData)
			await models.Trip.bulkCreate(tripsMock)
			await models.ChecklistItem.create(checklist)
			await models.ChecklistSubmission.create(checklistSubmission)
		})

		afterEach(async () => {
			await models.ChecklistSubmission
				.destroy({ force: true, truncate: { cascade: true } });
		})
		afterAll(async () => {
			await models.Bed.sync({ force: true });
			await models.Room.sync({ force: true });
			await models.GuestHouse
				.destroy({ force: true, truncate: { cascade: true } });
			await models.ChecklistSubmission
				.destroy({ force: true, truncate: { cascade: true } });
			await models.ChecklistItem.sync({ force: true });
			await models.Request.destroy({ force: true, truncate: { cascade: true } });
			await models.Trip.sync({ force: true });
			await models.User.destroy({ force: true, truncate: { cascade: true } });
		})

		it('should get checklist item submission', async (done) => {
			request
				.get('/api/v1/checklists/35678/submissions')
				.set('Authorization', token)
				.end((err, res) => {
					expect(res.body.success).toBe(true)
					expect(res.body.message)
						.toEqual('Checklist with submissions retrieved successfully')
					done()
				});
		})

		it('should return null for non existent submission', async (done) => {
			request
				.get('/api/v1/checklists/35678/submissions')
				.set('Authorization', token)
				.end((err, res) => {
					if (err) done(err);
					expect(res.body.success).toBe(false)
					expect(res.body.message).toEqual('No checklist have been submitted')
					done()
				});
		})
	})
});
