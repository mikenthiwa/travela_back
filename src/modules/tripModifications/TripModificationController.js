import models from '../../database/models';
import { countModifications, fetchModifications } from '../../helpers/tripModifications';
import Pagination from '../../helpers/Pagination';
import Error from '../../helpers/Error';
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
    const { body: { reason, type }, params: { requestId } } = req;

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

    return res.status(201).json({
      success: true,
      message: 'Trip Modification has been successfully submitted',
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

  static async updateModificationStatus(req, res) {
    const { params: { id }, user: { UserInfo: { email } }, body: { status } } = req;
    const user = await models.User.find({ where: { email } });
    const modification = await models.TripModification.findById(id);
    await modification.update({
      status,
      approverId: user.id
    });

    await modification.reload();
    await models.Request.update(
      { tripModificationId: null },
      {
        where: {
          id: modification.requestId
        }
      }
    );

    if (/approved/i.test(status)) {
      return TripModificationController.performModification(modification, req, res);
    }

    return res.status(200).json({
      success: true,
      message: `The trip modification has been ${status}`,
      modification
    });
  }

  static async performModification(modification, req, res) {
    const { requestId, type } = modification;
    if (type === 'Cancel Trip') {
      await models.sequelize.transaction(async () => {
        const request = await models.Request.findById(requestId);
        if (!request) {
          return Error.handleError('Request was not found', 404, res);
        }
        request.destroy();
        await RequestsController.handleDestroyTripComments(req);
      });

      return res.status(200).json({
        success: true,
        message: `Request ${requestId} has been successfully cancelled`,
        modification
      });
    }
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
}

export default TripModificationController;
