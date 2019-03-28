import moment from 'moment';
import TravelChecklist from '../modules/travelChecklist/TravelChecklistController';
import models from '../database/models';
import Error from '../helpers/Error';


export default class RequestValidator {
  static async checkTripBeds(trips, res, next) {
    let isValid = true;
    trips.forEach(async (trip, i) => {
      if (trip.bedId > 0) {
        const bed = await models.Bed.findById(trip.bedId, {
          include: [{
            required: true,
            model: models.Room,
            as: 'rooms',
            include: [{
              required: true,
              model: models.GuestHouse,
              as: 'guestHouses',
              where: { location: trip.destination }
            }]
          }]
        });
        if (!bed) isValid = false;
      }
      if (trips.length === i + 1) {
        if (isValid) {
          return next();
        }
        return res.status(400).json({
          success: false,
          message: 'A bed in this trip does not belong to its destination guesthouse'
        });
      }
    });
  }

  static async validateTripBeds(req, res, next) {
    try {
      const { trips } = req.body;
      RequestValidator.checkTripBeds(trips, res, next);
    } catch (error) {
      return Error.handleError(error, 404, res);
    }
  }

  static async checkStatusIsApproved(req, res, next) {
    try {
      const { requestId } = req.params;
      const request = await models.Request.findById(requestId);
      const approval = await models.Approval.findOne({ where: { requestId } });
      const checkApproval = (!approval || approval.status !== 'Approved');
      if (request.status !== 'Approved' && checkApproval) {
        return res.status(400).json({
          success: false,
          message: 'This request cannot be updated'
        });
      }
      return next();
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 404, res);
    }
  }

  static async validateRequestHasTrips(req, res, next) {
    try {
      const { requestId } = req.params;
      const trip = await models.Trip.findOne({ where: { requestId } });

      if (!trip) {
        const error = 'No trip exists for this request';
        return Error.handleError(error, 404, res);
      }
      return next();
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }

  static async validateDepartureDate(req, res, next) {
    try {
      const { requestId } = req.params;
      const trip = await models
        .Trip.findOne({ order: [['departureDate', 'ASC']], where: { requestId } });
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const date = currentDate.getDate();
      const currentDateString = `${currentDate.getFullYear()}-${month}-${date}`;
      if (moment(trip.departureDate).isSameOrAfter(currentDateString)) {
        return next();
      }
      return res.status(400).json({
        success: false,
        message: 'Departure date for a trip in this request has passed'
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }

  static async validateCheckListComplete(req, res, next) {
    try {
      const { requestId } = req.params;
      const percentage = await TravelChecklist.checkListPercentageNumber(req, res, requestId);
      if (percentage === 100) {
        return next();
      }
      return res.status(400).json({
        success: false,
        message: 'The checklist submission is yet to be completed'
      });
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }

  static async getTravelaUser(req, res, next) {
    const travelaUser = await models.User.findOne({
      where: {
        email: req.user.UserInfo.email
      }
    });
    if (!travelaUser) {
      return res.status(404).json({
        success: false,
        error: 'User does not exist in the application'
      });
    }
    req.travelaUser = travelaUser;
    next();
  }
}
