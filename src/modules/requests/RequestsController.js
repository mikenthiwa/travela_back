import dotenv from 'dotenv';

import models from '../../database/models';
import {
  createSubquery,
  includeStatusSubquery,
  asyncWrapper,
  retrieveParams
} from '../../helpers/requests';
import UserRoleController from '../userRole/UserRoleController';
import NotificationEngine from '../notifications/NotificationEngine';
import Error from '../../helpers/Error';
import RequestTransactions from './RequestTransactions';
import RequestUtils from './RequestUtils';
import RequestServices from './RequestServices';

dotenv.config();
let params = {};
class RequestsController {
  static setRequestParameters(req) {
    params = retrieveParams(req);
    params.userId = req.user.UserInfo.id;
    params.parameters = {
      req,
      limit: params.limit,
      offset: params.offset,
      modelName: 'Request',
      search: params.search
    };
  }

  static async getMultipleRoomsData(trips, requestData, requestDetails) {
    const multipleRoomsData = await RequestUtils.getMultipleRoomsData({ trips, requestData, requestDetails });

    return multipleRoomsData;
  }

  static async createRequest(req, res) {
    // eslint-disable-next-line
    let { trips, comments, ...requestDetails } = req.body;
    delete requestDetails.status; // requester cannot post status
    try {
      const { requestData, updatedTrips } = await RequestServices.createRequest(req, requestDetails, trips);

      await RequestTransactions.createRequestTransaction({
        req, res, requestData, trips: updatedTrips, comments
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error.message || error, error.status || 500, res);
    }
  }

  static async sendNotificationToRequester(req, res, request, message, mailTopic, mailType) {
    const { userId } = request;
    const recipient = await UserRoleController.getRecipient(null, userId);

    return NotificationEngine.sendMail(
      RequestUtils.getMailData(request, recipient, mailTopic, mailType, null, false)
    );
  }

  static async sendNotificationToManager(req, res, request, message, mailTopic, mailType) {
    const { userId, id, manager } = request;
    const recipient = await UserRoleController.getRecipient(manager);
    // map the mailType to a notificationType.
    const notificationTypeMap = {
      'New Request': 'pending',
      'Updated Request': 'general',
      'Deleted Request': 'general'
    };
    const notificationData = {
      senderId: userId,
      recipientId: recipient.userId,
      // if notificationType at this point is undefined then default to
      // general
      notificationType: notificationTypeMap[mailType] || 'general',
      message,
      notificationLink: `/requests/my-approvals/${id}`,
      senderName: req.user.UserInfo.name,
      senderImage: req.user.UserInfo.picture
    };
    NotificationEngine.notify(notificationData);
    return NotificationEngine.sendMail(
      RequestUtils.getMailData(request, recipient, mailTopic, mailType)
    );
  }

  static async sendNotificationToTravelAdmin(
    req, trips, request, originType, destinationType, Emailtopic, link, deadlink
  ) {
    await RequestServices.sendNotificationToTravelAdmin({
      req, trips, request, originType, destinationType, Emailtopic, link, deadlink
    });
  }

  static removeTripWhere(subquery) {
    const newSubquery = subquery;
    newSubquery.include.map((includeModel) => {
      const newIncludeModel = includeModel;
      if (newIncludeModel.where) {
        newIncludeModel.where = undefined;
      }
      return newIncludeModel;
    });
    return newSubquery;
  }

  static removeRequestWhere(subquery) {
    let newSubQuery = subquery;
    newSubQuery.where = { userId: params.userId };
    if (params.status) {
      newSubQuery = includeStatusSubquery(newSubQuery, params.status, 'Request');
    }
    return newSubQuery;
  }

  static generateSubquery(searchTrips) {
    let subquery = createSubquery(params.parameters);
    if (!searchTrips) {
      subquery = RequestsController.removeTripWhere(subquery);
    } else {
      subquery = RequestsController.removeRequestWhere(subquery);
    }
    return subquery;
  }

  static async getRequestsFromDb(subquery) {
    const { include, ...query } = subquery;
    const newSubquery = {
      include: [...include, {
        model: models.DynamicChecklistSubmissions,
        as: 'dynamicChecklistSubmission',
        attributes: ['completionCount'],
        where: undefined,
      }],
      ...query,
    };
    const requests = await models.Request.findAndCountAll(newSubquery);
    return requests;
  }

  static async returnRequests(req, res, requests) {
    const {
      count, pagination, allRequests, message
    } = await RequestServices.returnRequests(req, res, requests, params);
    return res.status(200).json({
      success: true,
      message,
      requests: allRequests,
      meta: { count, pagination }
    });
  }

  static async processResult(req, res, searchTrips = false) {
    const subquery = RequestsController.generateSubquery(searchTrips);
    let requests = { count: 0 };
    requests = await asyncWrapper(res, RequestsController.getRequestsFromDb, subquery);
    if (!requests.count && !searchTrips) {
      return RequestsController.processResult(req, res, !searchTrips);
    }
    return RequestsController.returnRequests(req, res, requests);
  }

  static async getUserRequests(req, res) {
    RequestsController.setRequestParameters(req);
    try {
      await RequestsController.processResult(req, res);
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async getTravellingTeammates(req, res) {
    try {
      const teammates = await RequestServices.getTravellingTeammates(req);
      res.status(200).json({
        success: true,
        teammates
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async getUserRequestDetails(req, res) {
    const { requestId } = req.params;
    try {
      const { error, requestData } = await RequestUtils.getRequestData(res, requestId);
      if (error) return Error.handleError(error.msg, error.status, res);
      return res.status(200).json({
        success: true,
        requestData
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError('Server Error', 500, res);
    }
  }

  static async updateRequest(req, res) {
    const { requestId } = req.params;
    const trips = await RequestUtils.setRoundTripAccomodation(req);
    try {
      await RequestUtils.validateTripDates(req.user.UserInfo.id, trips, requestId);

      await RequestTransactions.updateRequestTransaction(req, res, trips);
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error.message || error, error.status || 500, res);
    }
  }

  static async handleDestroyTripComments(req) {
    const { requestId } = req.params;
    await models.Trip.destroy({ where: { requestId } });
    await models.Comment.destroy({ where: { requestId } });
    await models.Approval.destroy({ where: { requestId } });
  }

  static async deleteRequest(req, res) {
    try {
      await RequestTransactions.deleteRequestTransaction(req, res);
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }

  static async verifyRequest(req, res) {
    try {
      const request = await RequestServices.verifyRequest(req);
      return res
        .status(200)
        .json({ success: true, message: 'Verification Successful', updatedRequest: { request } });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }
}

export default RequestsController;
