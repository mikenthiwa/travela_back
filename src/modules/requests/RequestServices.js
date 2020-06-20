import _ from 'lodash';
import moment from 'moment';
import Utils from '../../helpers/Utils';
import RequestUtils from './RequestUtils';
import RequestsController from './RequestsController';
import {
  asyncWrapper,
  getTravelTeams,
  switchInAppMessage
} from '../../helpers/requests';
import NotificationEngine from '../notifications/NotificationEngine';
import models from '../../database/models';
import Centers from '../../helpers/centers';
import UserRoleController from '../userRole/UserRoleController';
import { countByStatus, getTotalCount } from '../../helpers/requests/paginationHelper';
import TravelChecklistController from '../travelChecklist/TravelChecklistController';
import Pagination from '../../helpers/Pagination';

const noResult = 'No records found';

class RequestServices {
  static async createRequest(req, requestDetails, trips) {
    await RequestUtils.validateTripDates(req.user.UserInfo.id, trips);

    const requestData = {
      ...requestDetails,
      id: Utils.generateUniqueId(),
      userId: req.user.UserInfo.id,
      picture: req.user.UserInfo.picture,
      stipendBreakdown: JSON.stringify(requestDetails.stipendBreakdown)
    };
    const multipleRoomsData = await RequestsController.getMultipleRoomsData(trips, requestData, requestDetails);
    
    const availableRoomsAndBeds = await RequestUtils.fetchMultiple(multipleRoomsData);
    const allRooms = availableRoomsAndBeds.reduce((room, newList) => newList.concat(room));
    const availableBedSpaces = allRooms.map(bedId => bedId.id);
    const updatedTrips = await RequestServices.getTrips(trips, availableBedSpaces);
    return { requestData, updatedTrips };
  }

  static async getTrips(trips, availableBedSpaces) {
    const updatedTrips = trips.map((trip) => {
      if (
        availableBedSpaces.length < 1
        || !availableBedSpaces.includes(trip.bedId)
        || !trip.bedId
      ) {
        // eslint-disable-next-line
        trip.accommodationType = trip.bedId == -1 ? 'Hotel Booking' : 'Not Required';
        // eslint-disable-next-line
        trip.bedId = null;
      }
      return trip;
    });
    return updatedTrips;
  }

  static async sendNotificationToTravelAdmin({
    req, trips, request, originType, destinationType, Emailtopic, link, deadlink
  }) {
    const allAdmins = await getTravelTeams(trips);
    const { picture, id: senderId } = req.user.UserInfo;
    const { id, name, tripType } = request;
    
    if (allAdmins) {
      allAdmins.forEach((admin, index) => {
        const originEmailData = {
          sender: name,
          topic: Emailtopic,
          type: originType,
          details: {
            requestId: id, requesterName: name, location: trips[index].destination, tripType
          },
          redirectLink: link
        };
        const destinationEmailData = {
          sender: name,
          topic: Emailtopic,
          type: destinationType,
          details: {
            requestId: id, requesterName: name, location: trips[index].destination, tripType
          },
          redirectLink: link
        };
        
        [originType, destinationType].forEach((locationType, i) => this.inAppTravelAdmin(
          trips[index].destination, admin[i], name, id, locationType, picture, senderId, deadlink, tripType
        ));

        if (admin[0].length) NotificationEngine.sendMailToMany(admin[0], originEmailData);
        if (admin[1].length) NotificationEngine.sendMailToMany(admin[1], destinationEmailData);
      });
    }
  }

  static async inAppTravelAdmin(
    tripLocation,
    admins, name, id, messageType, picture, senderId,
    link, tripType
  ) {
    const customMessage = switchInAppMessage(messageType, id, name, tripLocation, tripType);
    NotificationEngine.notifyMany({
      users: admins, senderId, name, picture, id, message: customMessage, link
    });
  }

  static async verifyRequest(req) {
    const { requestId } = req.params;
    const { name, picture, id: senderId } = req.user.UserInfo;
    const request = await models.Request.findById(requestId);
    const approval = await models.Approval.findOne({ where: { requestId } });
    approval.status = 'Verified';
    request.status = 'Verified';
    await request.save();
    await approval.save();
    const { id, userId } = request;

    const recipient = await UserRoleController.getRecipient(null, userId);
    const centerIds = await Centers.getDestinationCenters(requestId);

    if (centerIds.length) {
      await RequestUtils.notifyTravelAdmins({
        centerIds, request, senderId, name, picture, userId, id
      });
    }

    await RequestUtils.notifyRequester({
      name, request, recipient, senderId, picture, userId, id
    });
    await RequestUtils.sendEmailToFinanceTeam(request);
    return request;
  }

  static async getTravellingTeammates(req) {
    const { dept } = req.params;
    const currentUserId = req.user.UserInfo.id;
    const today = moment().format('YYYY-MM-DD');
    const requests = await RequestUtils.findVerifiedRequests({ dept, today, currentUserId });
    const uniqRequests = _.uniqBy(requests, 'userId');

    const teammates = uniqRequests.map(({ trips, name, picture }) => {
      const { returnDate } = trips[trips.length - 1];
      return {
        name,
        picture,
        destination: trips[0].destination.split(',')[0],
        departureDate: trips[0].departureDate,
        returnDate
      };
    });
    return teammates;
  }

  static async getRequestPagination(params, count, requests) {
    const pagination = Pagination.getPaginationData(
      params.page,
      params.limit,
      getTotalCount(params.status, count)
    );
    const message = params.search && !requests.count
      ? noResult
      : Utils.getResponseMessage(pagination, params.status, 'Request');
    return { pagination, message };
  }

  static async returnRequests(req, res, requests, params) {
    const count = await asyncWrapper(
      req,
      countByStatus,
      models.Request,
      params.userId,
      params.search
    );
    const { pagination, message } = await RequestServices.getRequestPagination(params, count, requests);
    const newRequest = Promise.all(
      requests.rows.map(async (request) => {
        const travelCompletion = await TravelChecklistController.checkListPercentage(
          req, res, request.id
        );
        request.dataValues.travelCompletion = travelCompletion;
        return request;
      })
    );

    const allRequests = await newRequest;
    return {
      allRequests, count, pagination, message
    };
  }
}

export default RequestServices;
