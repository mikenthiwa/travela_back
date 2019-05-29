import models from '../database/models';
import Validator from './Validator';


const sendResponse = (res, status, message) => res.status(status).json({
  success: status < 400,
  message
});

class TripModificationsValidator {
  static async checkExistingRequest(req, res, next) {
    const { params: { requestId } } = req;
    const request = await models.Request.findOne({
      where: {
        id: requestId
      }
    });

    if (!request) {
      return sendResponse(res, 404, `Request with id ${requestId} does not exist`);
    }
    next();
  }

  static async checkExistingModification(req, res, next) {
    const { params: { id } } = req;
    const modification = await models.TripModification.findById(id);
    if (!modification) {
      return sendResponse(res, 404, `Trip modification with id ${id} does not exist`);
    }
    return next();
  }

  static async validateRequest(req, res, next) {
    const { user: { UserInfo: { id } }, params: { requestId } } = req;
    const request = await models.Request.findOne({
      where: {
        id: requestId,
        userId: id
      }
    });
    if (!request) {
      return sendResponse(res, 401, 'You are not authorized to modify this request');
    }

    if (request.status === 'Open') {
      return sendResponse(res, 400,
        'A modification request can only be made on a request after approval by the manager');
    }
    next();
  }

  static async validateDuplicateModification(req, res, next) {
    const { params: { requestId }, body: { type } } = req;
    const modification = await models.TripModification.findOne({
      where: {
        requestId,
        type,
        status: 'Open'
      }
    });

    if (modification) {
      return sendResponse(res, 400,
        'You already have a pending trip modification for this request');
    }
    next();
  }

  static validateModification(req, res, next) {
    req.checkBody('type', 'Modification type should either be "Cancel Trip" or "Modify Dates"')
      .isString()
      .isIn(['Cancel Trip', 'Modify Dates']);
    req.checkBody('reason', 'Modification reason is required')
      .isString().trim().notEmpty()
      .len({ max: 140 })
      .withMessage('Modification reason should be at most 140 characters');

    Validator.errorHandler(res, req.validationErrors(), next);
  }

  static async validateApproval(req, res, next) {
    const { params: { id } } = req;
    req.checkBody('status', 'Approval status can either be "Approved" or "Rejected"')
      .isString()
      .isIn(['Approved', 'Rejected']);

    if (req.validationErrors().length) {
      return Validator.errorHandler(res, req.validationErrors(), next);
    }
    const modification = await models.TripModification.findOne({
      where: {
        id
      }
    });

    if (modification.status !== 'Open') {
      return sendResponse(res, 400,
        'Trip modification request has already been approved/rejected');
    }

    return next();
  }
}


export default TripModificationsValidator;
