import models from '../../database/models';
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

    return TripModificationController.performModification(
      'Approved', user.UserInfo, modification, req, res
    );
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
      { tripModificationId: null },
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
