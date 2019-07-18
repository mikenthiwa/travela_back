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
      const [newFlightEstimate, isCreated] = await models.FlightEstimate.findOrCreate({
        where: { ...userInput },
        defaults: { amount: flightEstimate, createdBy }
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
    const { query: { page, limit } } = req;
    const offset = page ? limit * (page - 1) : null;

    try {
      const { count, rows } = await models.FlightEstimate.findAndCountAll({
        include: [{
          model: models.User,
          as: 'creator',
          attributes: ['fullName', 'id']
        }],
        offset,
        limit
      });
      const numberOfPages = limit ? (Math.ceil(count / limit)) : 1;
      return res.status(200).json({
        success: true,
        totalEstimates: count,
        estimatesOnPage: limit,
        currentPage: page,
        numberOfPages,
        message: 'Flight Estimates fetched successfully',
        flightEstimates: rows
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
}
