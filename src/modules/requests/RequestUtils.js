
import _ from 'lodash';
import { generateRangeQuery } from '../../helpers/requests';
import models from '../../database/models';
import BaseException from '../../exceptions/baseException';
import RoomsManager from '../guestHouse/RoomsManager';
import TravelReadinessUtils from '../travelReadinessDocuments/TravelReadinessUtils';
import UserRoleController from '../userRole/UserRoleController';
import NotificationEngine from '../notifications/NotificationEngine';

const { Op } = models.Sequelize;
export default class RequestUtils {
  /**
   * Validate the trip dates provided in the request by the user
   * @param userId -> the user's id in the database
   * @param trips -> the trips sent in the request body
   * @param requestId -> the request id of the request being updated
   * @return {Promise<void>}
   */
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
  
  // Finance team email notification
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
      redirectLink: `${process.env.REDIRECT_URL}/requests/my-verifications/${id}`
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
}
