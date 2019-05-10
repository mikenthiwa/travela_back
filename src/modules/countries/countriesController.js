import models from '../../database/models';
import Error from '../../helpers/Error';

export default class countriesController {
  static async addCountry(req, res) {
    const { countries } = req.body;
    try {
      const createCountries = await models.Country.bulkCreate(
        countries.map(eachCountry => ({
          country: eachCountry,
          regionId: req.params.regionId
        })),
        { returning: true }
      );
      return res.status(201).json({
        success: true,
        message: 'Country added successfully',
        countries: createCountries
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }

  static async getCountries(req, res) {
    try {
      const fetchCountries = await models.Country.findAll({
        where: { regionId: req.params.regionId },
        order: [['id', 'DESC']]
      });
      return res.status(200).json({
        success: true,
        message: 'Successfully retrieved countries',
        countries: fetchCountries
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }
}
