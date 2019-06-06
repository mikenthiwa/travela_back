
import _ from 'lodash';
import { generateRangeQuery } from '../../helpers/requests';
import models from '../../database/models';
import BaseException from '../../exceptions/baseException';
import RoomsManager from '../guestHouse/RoomsManager';
import TravelReadinessUtils from '../travelReadinessDocuments/TravelReadinessUtils';
import UserRoleController from '../userRole/UserRoleController';
import NotificationEngine from '../notifications/NotificationEngine';
import Users from '../../helpers/user';
import getRequests from './getRequests.data';

const { Op } = models.Sequelize;
export default class RequestUtils {
  static async validateTripDates(userId, trips, requestId) {
    // order the incoming trips by their departure dates then select the first and last trips
    const orderedTrips = _.orderBy(trips, ['departureDate'], ['asc']);
    const [firstTrip, lastTrip] = [_.first(orderedTrips), _.last(orderedTrips)];
    const checkStatus = 'Checked Out';
    const requestsInRange = await models.Request.findAll(
      {
        where: {
          [Op.and]: [
            { userId }, { id: { [Op.ne]: requestId || '' } }, { status: { [Op.ne]: 'Rejected' } }
          ]
        },
        include: [{
          model: models.Trip,
          as: 'trips',
          where: generateRangeQuery(firstTrip.departureDate, lastTrip.returnDate, checkStatus),
          attributes: ['departureDate', 'returnDate'],
        }],
        attributes: ['id']
      }
    );

    if (requestsInRange.length > 0) {
      throw new BaseException('Sorry, you already have a request for these dates.', 400);
    }
  }

  static async fetchMultiple(roomsData) {
    const rooms = Promise.all(roomsData.map(
      async (fetchRoomData) => {
        const roomsReturned = await RoomsManager.fetchAvailableRooms(
          fetchRoomData,
        );
        return roomsReturned;
      }
    ));
    return rooms;
  }

  static getMailData(request, recipient, topic, type, redirectPath, toManager = true) {
    const redirect = redirectPath || (
      toManager ? `/redirect/requests/my-approvals/${request.id}`
        : `/redirect/requests/${request.id}/checklist`);
    return {
      recipient: { name: toManager ? request.manager : request.name, email: recipient.email },
      sender: toManager ? request.name : request.manager,
      requestId: request.id,
      topic,
      type,
      redirectLink:
        `${process.env.REDIRECT_URL}${redirect}`,
    };
  }
  
  static async getRequest(requestId, userId) {
    const request = await models.Request.find({
      where: { userId, id: requestId },
    });
    return request;
  }

  static async getTrips(requestId) {
    const trips = await models.Trip.findAll({
      where: { requestId },
    });
    return trips;
  }
  
  static async sendEmailToFinanceTeam(request) {
    const {
      userId: requesterId, name: requesterName, id
    } = request;
    const { location: requesterLocation } = await models.User.findOne({
      where: {
        userId: requesterId
      }
    });

    const data = {
      requestId: id,
      topic: `Successful Travel Readiness Verification for ${requesterName}'s Trip`,
      type: 'Notify finance team members',
      details: {
        requesterName,
      },
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/my-verifications/${id}`
    };

    const {
      users: financeTeamMembers
    } = await UserRoleController.calculateUserRole('70001') || {};

    const financeTeam = await TravelReadinessUtils.getRoleMembers(
      financeTeamMembers,
      requesterLocation
    );

    if (financeTeam.length) {
      NotificationEngine.sendMailToMany(financeTeam, data);
    }
  }

  static async findVerifiedRequests({
    dept, today, currentUserId
  }) {
    const requests = await models.Request.findAll({
      where: { department: dept, status: 'Verified', userId: { [Op.ne]: currentUserId } },
      order: [[{ model: models.Trip, as: 'trips' }, 'departureDate', 'asc']],
      include: [
        {
          model: models.Trip,
          as: 'trips',
          where: { departureDate: { [Op.gte]: today } }
        }
      ]
    });
    return requests;
  }

  static async getMultipleRoomsData({ trips, requestData, requestDetails }) {
    const multipleRoomsData = trips.map(trip => ({
      arrivalDate: (requestData.tripType === 'oneWay'
      || (requestData.tripType === 'multi' && !trip.returnDate))
        ? trip.departureDate : trip.returnDate,
      departureDate: trip.departureDate,
      location: trip.destination,
      gender: requestDetails.gender,
      travelReasons: trip.travelReasons,
      otherTravelReasons: trip.otherTravelReasons
    }));
    return multipleRoomsData;
  }

  static notificationMessages(senderId, name, request, picture, userId, id) {
    const travelAdminEmailData = {
      topic: 'Travel Request Verified',
      sender: name,
      type: 'Travel Request Verified',
      details: {
        RequesterName: request.name,
        id: request.id
      },
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/budgets/${id}`
    };

    const notificationData = {
      senderId,
      senderName: name,
      senderImage: picture,
      recipientId: userId,
      notificationType: 'general',
      requestId: id,
      message: `Hi ${request.name}, Congratulations, your request ${id} has been verified by the travel team.
      You are now ready for this trip. Do have a safe trip.`,
      notificationLink: `/requests/${id}`
    };
    return {
      travelAdminEmailData,
      notificationData
    };
  }
  
  static async notifyTravelAdmins({
    centerIds, request, senderId, name, picture, userId, id
  }) {
    const travelAdmins = await Users.getDestinationTravelAdmin(centerIds);
    const message = `This is to inform you that ${request.name}'s request ${request.id} to visit 
      your centre has just been verified by the local travel team. Please be aware of this request and plan for the traveller.`;
    NotificationEngine.notifyMany({
      users: travelAdmins, senderId, name, picture, id, message
    });
    NotificationEngine.sendMailToMany(
      travelAdmins,
      RequestUtils.notificationMessages(senderId, name, request, picture, userId, id).travelAdminEmailData
    );
  }

  static async notifyRequester({
    name, request, recipient, senderId, picture, userId, id
  }) {
    const emailRequest = { name, manager: request.name, id: request.id };
    const emailData = RequestUtils.getMailData(
      emailRequest,
      recipient,
      'Travel Request Verified',
      'Verified',
      `/redirect/requests/${emailRequest.id}`
    );
    NotificationEngine.notify(
      RequestUtils.notificationMessages(senderId, name, request, picture, userId, id)
        .notificationData
    );
    NotificationEngine.sendMail(emailData);
  }

  static async setRoundTripAccomodation(req) {
    let { trips } = req.body;
    // eslint-disable-next-line
    trips = trips.map(trip => {
      if (trip.bedId < 1) {
        // eslint-disable-next-line
        trip.accommodationType = trip.bedId == -1 ? 'Hotel Booking' : 'Not Required';
        // eslint-disable-next-line
        trip.bedId = null;
      } else {
        // eslint-disable-next-line
        trip.accommodationType = 'Residence';
      }
      return trip;
    });
    return trips;
  }

  static async getRequestData(res, requestId) {
    const requestData = await getRequests(requestId, models);
    if (!requestData) {
      return { error: { msg: `Request with id ${requestId} does not exist`, status: 404 } };
    }
    if (requestData.status !== 'Open') {
      const approver = await models.Approval.findOne({ where: { requestId } });
      const approverImage = await UserRoleController.getRecipient(null, null, approver.approverId);
      requestData.dataValues.approver = approver.approverId;
      requestData.dataValues.timeApproved = approver.updatedAt;
      requestData.dataValues.approverImage = approverImage.picture;
      requestData.dataValues.budgetApprovedBy = approver.budgetApprover;
      requestData.dataValues.budgetApprovedAt = approver.budgetApprovedAt;
    }
    requestData.dataValues.stipend = requestData.dataValues.stipendBreakdown
      ? JSON.parse(requestData.dataValues.stipendBreakdown)
      : requestData.dataValues.stipend;
    delete requestData.dataValues.stipendBreakdown;
    return { requestData };
  }
}
