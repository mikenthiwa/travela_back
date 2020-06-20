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
}


export default TripModificationsValidator;
