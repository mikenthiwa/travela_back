import models from '../../database/models';
import RequestUtils from '../requests/RequestUtils';
import RequestsController from '../requests/RequestsController';
import { notifyAndMailAdminsForTripModification } from '../../helpers/tripModifications';

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

    if (type === 'Cancel Trip') {
      return TripModificationController.performModification(
        'Approved', user.UserInfo, modification, req, res
      );
    }

    return res.status(200).json({
      success: true,
      message: `You can now modify Request ${requestId}'s details`,
      modification
    });
  }

  static async performModification(status, user, modification, req, res) {
    const {
      user: {
        UserInfo: {
          email, id: requesterId, fullName: requesterName, picture
        }
      }
    } = req;
    const modifiedBy = await models.User.find({ where: { email } });

    await modification.update({
      status,
      approverId: modifiedBy.id
    });

    await models.Request.update(
      { tripModificationId: modification.id },
      { where: { id: modification.requestId } }
    );

    const { requestId, type } = modification;

    if (type === 'Cancel Trip') {
      await notifyAndMailAdminsForTripModification({
        requestId,
        requesterId,
        requesterName,
        picture
      }, 'Cancel Trip');
      return TripModificationController.cancelTrip(requestId, modification, req, res);
    }

    if (type === 'Modify Dates') {
      return TripModificationController.modifyTrip(requestId, modification, req, res);
    }
  }

  static async cancelTrip(requestId, modification, req, res) {
    await models.sequelize.transaction(async () => {
      const request = await models.Request.findById(requestId);
      request.destroy();
      await RequestsController.handleDestroyTripComments(req);
    });

    return res.status(200).json({
      success: true,
      message: `Request ${requestId} has been successfully cancelled`,
      modification
    });
  }

  static async modifyTrip(requestId, modification, req) {
    const request = await RequestUtils.getRequest(requestId, req.user.UserInfo.id);
    const approvals = await models.Approval.findOne({
      where: { requestId }, order: [['createdAt', 'DESC']]
    });

    await request.update({
      status: 'Open', budgetStatus: 'Open'
    });

    await approvals.update({
      status: 'Open',
      budgetStatus: 'Open',
      budgetApprover: null,
      budgetApprovedAt: null
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

    return res.status(200).json({
      success: true,
      pastModifications
    });
  }
}

export default TripModificationController;
