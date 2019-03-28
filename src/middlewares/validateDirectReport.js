import models from '../database/models';
import Error from '../helpers/Error';

const validateDirectReport = async (req, res, next) => {
  const { travelaUser } = req;
  const { requestId } = req.params;
  const request = await models.Request.findById(requestId);
  if (!request) {
    const error = 'Request not found';
    return Error.handleError(error, 404, res);
  }

  // FIX: replace name with Id
  if (travelaUser.fullName !== request.manager) {
    return res.status(403).json({
      success: false,
      error: 'Permission denied, you are not requesters manager',
    });
  }
  req.request = request;
  return next();
};

export default validateDirectReport;
