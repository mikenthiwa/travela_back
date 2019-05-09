import models from '../../database/models';
import ApprovalsController from '../approvals/ApprovalsController';
import Utils from '../../helpers/Utils';
import RequestsController from './RequestsController';
import Error from '../../helpers/Error';
import RequestUtils from './RequestUtils';
import UserRoleController from '../userRole/UserRoleController';

const { Op } = models.Sequelize;

export default class RequestTransactions {
  static async createRequestTransaction(req, res, requestData, trips, comments) {
    let request;
    await models.sequelize.transaction(async () => {
      request = await models.Request.create(requestData);
      const requestTrips = await models.Trip.bulkCreate(
        trips.map(trip => ({
          ...trip,
          requestId: request.id,
          id: Utils.generateUniqueId()
        }))
      );

      // create a comment submitted with the request
      if (comments.comment) {
        const userIdInteger = await UserRoleController.getRecipient(null, req.user.UserInfo.id);
        const commentData = {
          requestId: request.id,
          documentId: null,
          comment: comments.comment,
          id: Utils.generateUniqueId(),
          userId: userIdInteger.id
        };
        await models.Comment.create(commentData);
      }

      const approval = await ApprovalsController.createApproval(request);
      request.dataValues.trips = requestTrips;

      this.sendNotification(req, res, request, requestTrips);

      return res.status(201).json({
        success: true,
        message: 'Request created successfully',
        request,
        approval
      });
    });
  }

  static sendNotification(req, res, request, trips) {
    const message = 'created a new travel request';
    const { id } = request;
    const link = `${process.env.REDIRECT_URL}/requests/${id}`;
    RequestsController.sendNotificationToManager(
      req,
      res,
      request,
      message,
      'New Travel Request',
      'New Request'
    );
    RequestsController.sendNotificationToRequester(
      req,
      res,
      request,
      message,
      'New Travel Request',
      'New Requester Request'
    );

    RequestsController.sendNotificationToTravelAdmin(
      req,
      trips,
      request,
      'Request created from origin Travel Admin',
      'Request created to visit destination Travel Admin',
      'New Request',
      link
    );
  }

  static async updateRequestTrips(trips, tripData, requestId) {
    const alteredTripData = { ...tripData };
    // Delete trips with ids not included in the update field
    const tripIds = trips.filter(trip => trip.id !== undefined).map(trip => trip.id);
    await models.Trip.destroy({
      where: {
        requestId,
        id: { [Op.notIn]: tripIds }
      }
    });
    alteredTripData.bedId = tripData.bedId < 1 ? null : tripData.bedId;
    const trip = await models.Trip.findById(alteredTripData.id);
    let requestTrip;
    if (trip) {
      requestTrip = await trip.updateAttributes(alteredTripData);
    } else {
      requestTrip = await models.Trip.create({
        requestId,
        ...alteredTripData,
        id: Utils.generateUniqueId()
      });
    }
    return requestTrip;
  }

  static async updateRequestTransaction(req, res, trips) {
    const { ...requestDetails } = req.body;
    const { requestId } = req.params;
    await models.sequelize.transaction(async () => {
      const userId = req.user.UserInfo.id;
      const request = await RequestUtils.getRequest(requestId, userId);
      if (!request) {
        return Error.handleError('Request was not found', 404, res);
      }
      if (request.status !== 'Open') {
        const error = `Request could not be updated because it has been ${request.status.toLowerCase()}`;
        return Error.handleError(error, 409, res);
      }
      const requestTrips = await Promise.all(
        trips.map(trip => RequestTransactions.updateRequestTrips(trips, trip, request.id))
      );
      delete requestDetails.status; // status cannot be updated by requester
      requestDetails.stipendBreakdown = JSON.stringify(requestDetails.stipendBreakdown);
      const updatedRequest = await request.updateAttributes(requestDetails);
      const message = 'edited a travel request';

      const requestToApprove = await models.Approval.findOne({ where: { requestId: request.id } });

      if (!requestToApprove) {
        const error = 'Approval request not found';

        /* istanbul ignore next */
        return Error.handleError(error, 404, res);
      }
      await requestToApprove.update({ approverId: req.body.manager });
      RequestsController.sendNotificationToManager(
        req,
        res,
        request,
        message,
        'Updated Travel Request',
        'Updated Request'
      );
      return res.status(200).json({
        success: true,
        request: updatedRequest,
        trips: requestTrips
      });
    });
  }

  static async deleteRequestTransaction(req, res) {
    const { requestId } = req.params;
    const userId = req.user.UserInfo.id;
    await models.sequelize.transaction(async () => {
      const request = await RequestUtils.getRequest(requestId, userId);
      const trips = await RequestUtils.getTrips(requestId);
      if (!request) {
        return Error.handleError('Request was not found', 404, res);
      }
      if (request.status !== 'Open') {
        return Error.handleError(`Request is already ${request.status.toLowerCase()}`, 409, res);
      }
      request.destroy();
      RequestsController.handleDestroyTripComments(req);
      await this.sendNotificationOnDelete(req, res, request, trips);
      const message = `Request ${request.id} has been successfully deleted`;
      return res.status(200).json({
        success: true,
        message
      });
    });
  }

  static async sendNotificationOnDelete(req, res, request, trips) {
    const notificationMessage = 'deleted a travel request';
    const link = `${process.env.REDIRECT_URL}/requests/my-verifications`;
    const deadLink = '/#';
    RequestsController.sendNotificationToManager(
      req,
      res,
      request,
      notificationMessage,
      'Deleted Travel Request',
      'Deleted Request'
    );
    RequestsController.sendNotificationToTravelAdmin(
      req,
      trips,
      request,
      'Notify Origin Tavel Team On Request Deletion',
      'Notify Destination Tavel Team On Request Deletion',
      'Deleted Travel Request',
      link,
      deadLink
    );
  }
}
