import models from '../../database/models';
import Error from '../../helpers/Error';

class CentersController {
  static async createCenter(req, res) {
    try {
      const { newLocation } = req.body;
      const newCentre = await models.Center.create({ location: newLocation });
      return res.status(201).json({
        success: true,
        message: 'Successfully created a new centre',
        center: newCentre
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError('Server error', 500, res);
    }
  }

  static async getCenters(req, res) {
    try {
      const centers = await models.Center.findAll({
        order: [
          ['createdAt', 'DESC']
        ]
      });
      return res.status(200).json({
        success: true,
        message: 'Centres retrieved successfully',
        centers
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }
}

export default CentersController;
