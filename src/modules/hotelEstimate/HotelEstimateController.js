import { Op } from 'sequelize';
import models from '../../database/models';
import CustomError from '../../helpers/Error';
import fetchOneHotelEstimate from '../../helpers/hotelEstimate';

export default class HotelEstimateController {
  static async createHotelEstimate(req, res) {
    try {
      const { estimate, country, travelRegion } = req.body;
      const {
        UserInfo: { id: createdBy }
      } = req.user;
      const userInformation = await models.User.findOne({
        where: { userId: createdBy }
      });

      const regionValue = await HotelEstimateController.getRegionId(travelRegion);
      const countryValue = await HotelEstimateController.getCountryId(country);

      const newEstimate = await models.HotelEstimate.create({
        amount: estimate,
        regionId: regionValue,
        countryId: countryValue,
        createdBy: userInformation.id
      });
      const data = newEstimate.get({ plain: true });
      data.location = country || travelRegion;
      const userDetails = { name: userInformation.fullName, id: userInformation.id };
      data.createdBy = userDetails;
      return res.status(201).json({
        success: true,
        message: 'Successfully created a new hotel estimate',
        estimate: data
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getCountryId(country) {
    if (country) {
      const { id: countryId } = await models.Country.find({
        where: {
          country
        }
      });
      return countryId;
    }
    return null;
  }

  static async getRegionId(travelRegion) {
    if (travelRegion) {
      const { id: regionId } = await models.TravelRegions.find({
        where: {
          region: travelRegion
        }
      });
      return regionId;
    }
    return null;
  }

  static async getEstimates(country) {
    const fetchEstimatesQuery = await models.HotelEstimate.findAll({
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'fullName']
        },
        {
          model: models.Country,
          as: 'country',
          attributes: ['country']
        },
        {
          model: models.TravelRegions,
          as: 'travelRegions',
          attributes: ['region']
        }
      ],
      where:
        country === 'true' ? { countryId: { [Op.ne]: null } } : { regionId: { [Op.ne]: null } },
      attributes: ['id', 'amount']
    });
    return fetchEstimatesQuery;
  }

  static async getAllHotelEstimates(req, res) {
    try {
      const { country } = req.query;
      const estimates = await HotelEstimateController.getEstimates(country);
      const estimatesResponse = estimates.map((estimate) => {
        const userDetails = { id: estimate.creator.id, name: estimate.creator.fullName };
        const oneEstimateObject = {
          id: estimate.id,
          amount: estimate.amount,
          createdBy: userDetails
        };
        if (estimate.country === null) {
          oneEstimateObject.region = estimate.travelRegions.region;
          return oneEstimateObject;
        }
        if (estimate.travelRegions === null) {
          oneEstimateObject.country = estimate.country.country;
          return oneEstimateObject;
        }
        /* istanbul ignore next */
        return null;
      });
      const returnMessage = () => {
        if (estimates.length === 0) {
          return 'No hotel estimates have been created';
        }
        return 'Hotel Estimates retrieved successfully';
      };
      return res.status(200).json({
        success: true,
        message: returnMessage(),
        estimates: estimatesResponse
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error, 500, res);
    }
  }

  static async getOneHotelEstimate(req, res) {
    try {
      const {
        params: { id }
      } = req;
      const hotelEstimate = await fetchOneHotelEstimate(id);
      return res.status(200).json({
        success: true,
        hotelEstimate
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getRegionCountries(req, res) {
    try {
      const {
        params: { id }
      } = req;

      const mappedCountries = await models.Country.findAll({
        raw: true,
        where: {
          regionId: id
        },
        attributes: ['id', 'country']
      });
      return mappedCountries;
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async getEstimatesInRegion(req, res) {
    const {
      params: { id }
    } = req;
    const existingRegion = await models.TravelRegions.findByPk(id);
    if (!existingRegion) {
      return res.status(404).json({
        success: false,
        error: 'Region does not exist'
      });
    }
    const mappedCountries = await HotelEstimateController.getRegionCountries(req);

    const countriesIds = [...new Set(mappedCountries.map(mappedCountry => mappedCountry.id))];
    try {
      const estimates = await models.HotelEstimate.findAll({
        include: [
          {
            model: models.User,
            as: 'creator',
            attributes: ['id', 'fullName']
          },
          {
            model: models.Country,
            as: 'country',
            attributes: ['country']
          }
        ],
        where: {
          countryId: [...countriesIds]
        }
      });

      const estimatesResponse = [];

      await estimates.map((estimate) => {
        const userDetails = { id: estimate.creator.id, name: estimate.creator.fullName };

        const oneEstimateObject = {
          id: estimate.id,
          amount: estimate.amount,
          countryName: estimate.country.country,
          countryId: estimate.countryId,
          createdBy: userDetails
        };
        return estimatesResponse.push(oneEstimateObject);
      });

      const returnMessage = () => {
        if (estimatesResponse.length === 0) {
          return 'No hotel estimates have been created within this region';
        }
        return 'Hotel Estimates retrieved successfully';
      };

      return res.status(200).json({
        success: true,
        message: returnMessage(),
        estimates: estimatesResponse
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async updateHotelEstimate(req, res) {
    try {
      const {
        params: { id }
      } = req;
      const { estimate } = req.body;
      const hotelEstimate = await fetchOneHotelEstimate(id);
      await hotelEstimate.update({
        amount: estimate
      });
      return res.status(200).json({
        success: true,
        message: 'Hotel estimate updated successfully',
        hotelEstimate
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }

  static async deleteOneHotelEstimate(req, res) {
    try {
      const {
        params: { id }
      } = req;
      const hotelEstimate = await models.HotelEstimate.findById(id);
      await hotelEstimate.destroy();
      return res.status(200).json({
        success: true,
        message: 'Hotel Estimates deleted successfully'
      });
    } catch (error) {
      /* istanbul ignore next */
      CustomError.handleError(error.message, 500, res);
    }
  }
}
