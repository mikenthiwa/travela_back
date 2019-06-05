import models from '../../database/models';
import {
  countModifications, fetchModifications, notifyAndMailAdminsForTripModification
} from '../../helpers/tripModifications';
import Error from '../../helpers/Error';
import Pagination from '../../helpers/Pagination';
import RequestsController from '../requests/RequestsController';

const include = [
  {
    model: models.User,
    as: 'approvedBy'
  },
  {
    model: models.Request,
    as: 'request',
    attributes: ['id']
  }
];

class TripModificationController {
  static async createModification(req, res) {
    const { user, body: { reason, type }, params: { requestId } } = req;

    const modification = await models.TripModification.create({
      requestId,
      reason,
      type,
    }, {
      include
    });

    await models.Request.update(
      { tripModificationId: modification.id }, {
        where: {
          id: requestId
        }
      }
    );

    const notificationData = {
      requestId,
      requesterId: user.UserInfo.id,
      requesterName: user.UserInfo.fullName,
      picture: user.UserInfo.picture,
      tripModificationReason: reason
    };

    if (type === 'Cancel Trip') {
      return TripModificationController.performModification('Approved', user.UserInfo, modification, req, res);
    }

    if (type === 'Modify Dates') {
      await notifyAndMailAdminsForTripModification(notificationData);
    }

    return res.status(201).json({
      success: true,
      message: 'Trip Modification has been successfully submitted',
      modification
    });
  }

  static async updateModificationStatus(req, res) {
    const {
      params: { id }, user, user: { UserInfo: { email } }, body: { status }
    } = req;
    const modifiedBy = await models.User.find({ where: { email } });
    const modification = await models.TripModification.findById(id);

    if (/approved/i.test(status)) {
      return TripModificationController.performModification(status, user, modification, req, res);
    }

    await modification.update({
      status,
      approverId: modifiedBy.id
    });

    return res.status(200).json({
      success: true,
      message: `The trip modification has been ${status}`,
      modification
    });
  }


  static async performModification(status, user, modification, req, res) {
    const { user: { UserInfo: { email } } } = req;
    const modifiedBy = await models.User.find({ where: { email } });

    await modification.update({
      status,
      approverId: modifiedBy.id
    });

    await models.Request.update(
      { tripModificationId: null },
      { where: { id: modification.requestId } }
    );

    const { requestId, type } = modification;

    if (type === 'Cancel Trip') {
      return TripModificationController.cancelTrip(requestId, modification, req, res);
    }

    if (type === 'Modify Dates') {
      return TripModificationController.modifyTrip(requestId, modification, req, res);
    }
  }

  static async cancelTrip(requestId, modification, req, res) {
    await models.sequelize.transaction(async () => {
      const request = await models.Request.findById(requestId);
      if (!request) return Error.handleError('Request was not found', 404, res);
      request.destroy();
      await RequestsController.handleDestroyTripComments(req);
    });

    return res.status(200).json({
      success: true,
      message: `Request ${requestId} has been successfully cancelled`,
      modification
    });
  }

  static async modifyTrip(requestId, modification, req, res) {
    await models.sequelize.transaction(async () => {
      const requests = await models.Request.findByPk(requestId);
      const approvals = await models.Approval.findOne({
        where: { requestId }, order: [['createdAt', 'DESC']]
      });
      await requests.update({
        status: 'Open', budgetStatus: 'Open'
      });
      await approvals.update({
        status: 'Open',
        budgetStatus: 'Open',
        budgetApprover: null,
        budgetApprovedAt: null
      });
    });

    return res.status(200).json({
      success: true,
      message: `Request ${requestId}'s modification has been successfully approved`,
      modification
    });
  }

  static async getModifications(req, res) {
    const modifications = await fetchModifications(req);

    const count = await countModifications(req);
    const { page, limit } = Pagination.initializePagination(req);

    const message = modifications.count > 0
      ? 'Trip modifications retrieved successfully'
      : 'There are no existing trip modifications';

    return res.status(200).json({
      success: true,
      message,
      approvals: modifications.rows,
      meta: {
        count,
        pagination: Pagination.getPaginationData(page, limit, modifications.count)
      }
    });
  }

  static async getModificationsForRequest(req, res) {
    const { params: { requestId } } = req;
    const pastModifications = await models.TripModification.findAll({
      where: {
        requestId,
        status: ['Approved', 'Rejected']
      },
      include
    });
    const pendingModification = await models.TripModification.findOne({
      where: {
        requestId,
        status: 'Open'
      },
      include
    });

    return res.status(200).json({
      success: true,
      pendingModification,
      pastModifications
    });
  }
}

export default TripModificationController;
