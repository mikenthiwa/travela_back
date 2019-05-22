import models from '../../database/models';
import Error from '../../helpers/Error';
import getSearchQuery from './countriesUtils';
import Pagination from '../../helpers/Pagination';

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
    const { searchQuery } = req.query;
    const query = searchQuery ? await getSearchQuery(searchQuery) : {};
    query.regionId = req.params.regionId;
    try {
      const count = await models.Country.count({
        where: query
      });
      const { pageCount, currentPage, initialPage } = Pagination
        .getPaginationParams(req, count);
      const fetchCountries = await models.Country.findAll({
        where: query,
        ...initialPage,
        order: [['id', 'DESC']]
      });
      if (fetchCountries.length) {
        return res.status(200).json({
          success: true,
          message: 'Successfully retrieved countries',
          countries: fetchCountries,
          meta: {
            count,
            pageCount,
            currentPage,
          }
        });
      } if (searchQuery && !fetchCountries.length) {
        return res.status(200).json({
          success: false,
          message: 'No results found for the searched country'
        });
      }
      return res.status(200).json({
        success: false,
        message: 'No country records found'
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error, 500, res);
    }
  }
}
