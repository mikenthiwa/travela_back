import models from '../../database/models';
import CustomError from '../../helpers/Error';
import TravelStipend from '../../helpers/travelStipend';

export default class TravelStipendController {
  static async createTravelStipend(req, res) {
    try {
      const { stipend, center: country } = req.body;
      const { UserInfo: { id: createdBy } } = req.user;
      const { country: countryName } = await models.Country.find({
        where: {
          country
        }
      });
      const newStipend = await models.TravelStipends.create(
        {
          amount: stipend,
          country: countryName,
          createdBy
        }
      );
      return res.status(201).json({
        success: true,
        message: `Successfully created a new travel stipend for ${country}`,
        stipend: newStipend
      });
    } catch (error) { /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getAllTravelStipends(req, res) {
    try {
      const stipends = await models.TravelStipends.findAll({
        include: [{
          model: models.User,
          as: 'creator',
          attributes: ['fullName', 'id']
        }],
        attributes: ['id', 'amount', 'country'],
        order: [
          ['createdAt', 'ASC']
        ]
      });
      stipends.sort((a, b) => b.country === 'Default');

      return res.status(200).json({
        success: true,
        message: 'Travel Stipends retrieved successfully',
        stipends
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async deleteTravelStipend(req, res) {
    try {
      const travelStipendId = parseInt(req.params.id, 10);
      if (Number.isNaN(travelStipendId)) {
        return CustomError.handleError('Stipend id should be an integer', 400, res);
      }

      const foundTravelStipendId = await models.TravelStipends.findById(travelStipendId);
      if (foundTravelStipendId && foundTravelStipendId.country === 'Default') {
        return CustomError.handleError('Default Stipend should not be deleted', 400, res);
      }
      if (!foundTravelStipendId) {
        return CustomError.handleError('Travel stipend does not exist', 404, res);
      }
      await foundTravelStipendId.destroy();
      return res.status(200).json({
        success: true,
        message: 'Travel Stipend deleted successfully'
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async getOneTravelStipend(req, res) {
    try {
      const { params: { id } } = req;

      const travelStipend = await TravelStipend.findStipendById(id);

      if (!travelStipend) {
        return res.status(404).json({
          success: false,
          error: 'Travel stipend does not exist'
        });
      }
      return res.status(200).json({
        success: true,
        travelStipend
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async updateTravelStipend(req, res) {
    try {
      const { params: { id } } = req;
      const { center: country, stipend } = req.body;

      const sanitizedStipend = Math.abs(Number(
        stipend
      ));

      const travelStipend = await TravelStipend.findStipendById(id);

      if (!travelStipend) {
        return res.status(404).json({
          success: false,
          error: 'Travel stipend does not exist'
        });
      }

      await travelStipend.update({ country, amount: sanitizedStipend });

      return res.status(200).json({
        success: true,
        message: 'Travel stipend updated successfully',
        travelStipend
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getTravelStipendsByLocation(req, res) {
    const { locations } = req.query;
    const tripDestinations = locations.map((location) => {
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      return parsedLocation.destination.split(', ')[1];
    });
    try {
      const foundStipends = await TravelStipend.getStipendsByLocation(tripDestinations);
      const stipends = await TravelStipend.checkTravelStipend(foundStipends, tripDestinations);

      if (stipends.length) {
        return res.status(200).json({
          success: true,
          message: 'Stipends for locations found',
          stipends
        });
      }
      if (!stipends.length) {
        return res.status(404).json({
          success: true,
          message: 'There was no stipends found for specified location(s)',
        });
      }
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }
}
