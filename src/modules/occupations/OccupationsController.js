import models from '../../database/models';
import CustomError from '../../helpers/Error';


class OccupationsController {
  static async getAllOccupations(req, res) {
    try {
      const result = await models.Occupation.findAll();
      return res.status(200).json({
        success: true,
        occupations: result
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError('Server Error', 500, res);
    }
  }

  static async createOccupations(req, res) {
    try {
      const { occupationName } = req.body;
      if (!occupationName) {
        return res.status(400).json({
          request: req.body,
          success: false,
          message: 'new occupation name required'
        });
      }
      if (typeof occupationName !== 'string') {
        const message = 'occupation name should be a string';
        const request = req.body;
        return res.status(400).json({
          request,
          success: false,
          message
        });
      }
      // check if occupation already exists
      const existOccupation = await models.Occupation.findOne({
        where: req.body
      });
      if (existOccupation) {
        return res.status(409).json({
          success: false,
          message: 'occupation already exists'
        });
      }
      const result = await models.Occupation.create(req.body);
      return res.status(201).json({
        success: true,
        occupation: result
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError('Server Error', 500, res);
    }
  }
}
export default OccupationsController;
