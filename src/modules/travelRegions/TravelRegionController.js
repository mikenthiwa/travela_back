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

  static async deleteTravelRegion(req, res) {
    try {
      const { id } = req.params;
      const foundRegion = await models.TravelRegions.findById(id);
      await foundRegion.destroy();
      return res.status(200).json({
        success: true,
        mesage: 'Travel Region Successfuly Deleted',
        deletedTraveloRegion: foundRegion
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }

  static async updateTravelRegion(req, res) {
    try {
      const { body: { region, description } } = req;
      const newTravelRegion = await models.TravelRegions.update({
        region,
        description,
      },
      { where: { id: req.params.id }, returning: true, });
      return res.status(200).json({
        success: true,
        message: 'Travel Region Successfuly Updated',
        newTravelRegion,
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }
}
