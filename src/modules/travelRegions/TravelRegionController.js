import models from '../../database/models';
import Error from '../../helpers/Error';

export default class TravelRegionController {
  static async addRegion(req, res) {
    const { region, description } = req.body;
    try {
      const createRegion = await models.TravelRegions.create({
        region,
        description
      });
      return res.status(201).json({
        success: true,
        message: 'Region created successfully',
        TravelRegions: createRegion
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }

  static async getRegion(req, res) {
    try {
      const fetchRegions = await models.TravelRegions.findAll({
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json({
        success: true,
        message: 'Successfully retrieved regions',
        fetchRegions
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }
}
