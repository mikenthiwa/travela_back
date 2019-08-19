import _ from 'lodash';
import models from '../../database/models';
import CustomError from '../../helpers/Error';

export default class FlightEstimateController {
  static async createFlightEstimate(req, res) {
    const {
      body: {
        flightEstimate, ...userInput
      },
      user: { UserInfo: { id: createdBy } }
    } = req;
    
    const origin = userInput.originCountry || userInput.originRegion;
    const destination = userInput.destinationCountry || userInput.destinationRegion;
    try {
      const originCountryId = await FlightEstimateController
        .getCountryId(userInput.originCountry);
      const originRegionId = await FlightEstimateController
        .getRegionId(userInput.originRegion);
      const destinationCountryId = await FlightEstimateController
        .getCountryId(userInput.destinationCountry);
      const destinationRegionId = await FlightEstimateController
        .getRegionId(userInput.destinationRegion);
        
      const removeNull = object => _.pickBy(object);

      const locations = removeNull({
        originCountryId,
        originRegionId,
        destinationCountryId,
        destinationRegionId
      });
      const [newFlightEstimate, isCreated] = await models.FlightEstimate.findOrCreate({
        where: locations,
        defaults: {
          amount: flightEstimate,
          createdBy,
        }
      });
      

      if (!isCreated) {
        return res.status(409).json({
          success: false,
          message:
          `The flight estimate from ${origin} to ${destination} already exist`
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Successfully created a new flight estimate',
        flightEstimate: newFlightEstimate,
      });
    } catch (err) {
      /* istanbul ignore next */
      CustomError.handleError(err.message, 500, res);
    }
  }

  static async getAllFlightEstimates(req, res) {
    try {
      const flightEstimates = await FlightEstimateController.allFlightEstimates();
      return res.status(200).json({
        success: true,
        message: 'Flight Estimates fetched successfully',
        flightEstimates
      });
    } catch (err) {
    /* istanbul ignore next */
      CustomError.handleError(err.message, 400, res);
    }
  }


  static async getOneFlightEstimate(req, res) {
    const { params: { id } } = req;
    try {
      const flightEstimate = await models.FlightEstimate.findByPk(id, {
        include: [{
          model: models.User,
          as: 'creator',
          attributes: [
            'id', 'fullName', 'email',
            'department'
          ]
        }]
      });

      if (!flightEstimate) {
        return res.status(404).send({
          success: false,
          error: 'Flight Estimate with the given id does not exist'
        });
      }
      return res.status(200).json({
        success: true,
        flightEstimate
      });
    } catch (err) {
      /* istanbul ignore next */
      CustomError.handleError(err.message, 400, res);
    }
  }

  static async deleteFlightEstimate(req, res) {
    const { params: { id } } = req;
    try {
      const FlightEstimate = await models.FlightEstimate.findByPk(id);

      if (!FlightEstimate) {
        return CustomError
          .handleError('Flight Estimate with the given id does not exist', 404, res);
      }
      await FlightEstimate.destroy();

      return res.status(200).json({
        success: true,
        message: 'Flight Estimate successfully deleted'
      });
    } catch (err) {
      /* istanbul ignore next */
      CustomError.handleError(err.message, 400, res);
    }
  }
  
  static async updateFlightEstimate(req, res) {
    const { body: { flightEstimate }, params: { id } } = req;
    try {
      const FlightEstimate = await models.FlightEstimate.findByPk(id);
      if (!FlightEstimate) {
        return res.status(404).json({
          success: false,
          error: 'Flight Estimate with the given id does not exist'
        });
      }
      await FlightEstimate.update({ amount: flightEstimate });

      return res.status(200).json({
        success: true,
        message: 'Flight Estimate Successfully updated',
        flightEstimate: FlightEstimate
      });
    } catch (err) {
      /* istanbul ignore next */
      CustomError.handleError(err.message, 400, res);
    }
  }

  static async getCountryId(country) {
    if (country) {
      const [checkedCountry] = await models.Country.findOrCreate({
        where: { country },
        defaults: { regionId: 9999 },
        attributes: ['id']
      });
      return checkedCountry.id;
    }
  }

  static async getRegionId(travelRegion) {
    if (travelRegion) {
      const [region] = await models.TravelRegions.findOrCreate({
        where: { region: travelRegion },
        attributes: ['id']
      });
      return region.id;
    }
  }

  static async allFlightEstimates() {
    const { rows } = await models.FlightEstimate.findAndCountAll({
      include: [{
        model: models.User,
        as: 'creator',
        attributes: ['id', 'fullName']
      },
      {
        model: models.Country,
        as: 'originCountry',
        include: [{
          model: models.TravelRegions,
          as: 'region'
        }]
      },
      {
        model: models.TravelRegions,
        as: 'originRegion',
        attributes: ['region', 'id']
      },
      {
        model: models.Country,
        as: 'destinationCountry',
        include: [{
          model: models.TravelRegions,
          as: 'region'
        }]
      },
      {
        model: models.TravelRegions,
        as: 'destinationRegion',
        attributes: ['region', 'id']
      }],
    });
    const flightEstimates = rows.map(flightEstimate => ({
      originCountry: flightEstimate.originCountry && flightEstimate.originCountry.country,
      destinationCountry: flightEstimate.destinationCountry && flightEstimate.destinationCountry.country,
      originRegion: flightEstimate.originRegion && flightEstimate.originRegion.region,
      destinationRegion: flightEstimate.destinationRegion && flightEstimate.destinationRegion.region,
      amount: flightEstimate.amount,
      id: flightEstimate.id
    }));
    return flightEstimates;
  }
}
