
import models from '../database/models';
import Validator from './Validator';
import CustomError from '../helpers/Error';

const { Op } = models.Sequelize;
export default class TripValidator {
  static validateCheckType(req, res, next) {
    req.checkBody('checkType', 'Check type is required').notEmpty();
    req.checkBody('checkType', 'checkType must be "checkIn" or "checkOut"')
      .isIn(['checkIn', 'checkOut']);
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async checkTripExists(req, res, next) {
    const { tripId } = req.params;
    try {
      const trip = await models.Trip.findById(tripId);
      if (!trip) {
        return res.status(400).json({
          success: false,
          message: 'Trip does not exist'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
  }

  static async checkTripOwner(req, res, next) {
    const { tripId } = req.params;
    const userId = req.user.UserInfo.id;
    try {
      const trip = await models.Trip.findOne({
        where: { id: tripId },
        include: [{
          required: true,
          model: models.Request,
          as: 'request',
          where: { userId },
        }]
      });
      if (!trip) {
        return res.status(403).json({
          success: false, message: 'You don\'t have access to this trip'
        });
      }
      next();
    } catch (error) { /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
  }

  static async checkTripVerified(req, res, next) {
    const { tripId } = req.params;
    const userId = req.user.UserInfo.id;
    try {
      const trip = await models.Trip.findOne({
        where: { id: tripId },
        include: [{
          required: true,
          model: models.Request,
          as: 'request',
          where: { userId, status: 'Verified' },
        }]
      });
      if (!trip) {
        return res.status(400).json({
          success: false, message: 'This trip is not verified'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
  }

  static async checkTravelAdmin(req, res, next) {
    const { email } = req.user.UserInfo;
    try {
      const user = await models.User.findOne({
        where: {
          email
        },
      });
      const userRole = await models.UserRole.findOne({
        where: {
          userId: user.id,
          roleId: {
            [Op.in]: [10948, 29187]
          }
        }
      });
      if (!userRole) {
        return res.status(403).json({
          message: 'Only a Travel Admin can perform this action',
          success: false
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('User not found in database', 400, res);
    }
  }

  static validateBed(req, res, next) {
    req.checkBody('bedId', 'Bed id is required').notEmpty();
    req.checkBody('bedId', 'Bed id is required and must be a Number').isInt();
    const errorsObject = req.validationErrors();
    Validator.errorHandler(res, errorsObject, next);
  }

  static validateReason(req, res, next) {
    req.checkBody('reason', 'Reason for change is required').notEmpty();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async checkBedExists(req, res, next) {
    if (req.body.bedId < 0) return next();

    try {
      const bed = await models.Bed.findById(req.body.bedId);
      if (!bed) {
        return res.status(400).json({
          success: false, message: 'Bed does not exist'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
  }

  static createTripDateSearchClause(trip) {
    return {
      [Op.or]: {
        [Op.and]: {
          departureDate: { [Op.lte]: trip.departureDate },
          returnDate: { [Op.gte]: trip.returnDate },
        },
        departureDate: {
          [Op.gte]: new Date(trip.departureDate),
          [Op.lte]: new Date(trip.returnDate)
        },
        returnDate: {
          [Op.gte]: new Date(trip.departureDate),
          [Op.lte]: new Date(trip.returnDate)
        }
      }
    };
  }

  static async isBedAvailable(req, res, next) {
    if (req.body.bedId < 0) return next();

    const { tripId } = req.params;
    const { bedId } = req.body;
    try {
      const trip = await models.Trip.findById(tripId);
      const dateFilter = TripValidator.createTripDateSearchClause(trip);
      const trips = await models.Trip.findAll({
        where: {
          id: { [Op.ne]: trip.id },
          bedId,
          ...dateFilter
        },
        include: [{
          required: true,
          model: models.Request,
          as: 'request',
          where: { status: { [Op.ne]: 'Rejected' } },
        }]
      });
      if (trips && trips.length > 0) {
        return res.status(400).json({ success: false, message: 'Bed is currently unavailable' });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
  }

  static async isRoomFaulty(req, res, next) {
    if (req.body.bedId < 0) return next();

    const { bedId } = req.body;
    try {
      const bed = await models.Bed.findById(bedId);
      const room = await models.Room.findById(bed.roomId);
      if (room.faulty) {
        return res.status(400).json({
          success: false,
          message: 'Room is currently faulty'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
  }

  static async isGenderAllowed(req, res, next) {
    if (req.body.bedId < 0) return next();

    try {
      const { bedId } = req.body;
      const trip = await models.Trip.findById(req.params.tripId, {
        include: [{ model: models.Request, as: 'request' }]
      });
      const bed = await models.Bed.findById(parseInt(bedId, 10),
        { attributes: ['roomId'] });
      const dateFilter = TripValidator.createTripDateSearchClause(trip);
      let beds = await models.Bed.findAll({
        attributes: ['id'],
        where: { roomId: bed.roomId, id: { [Op.ne]: parseInt(bedId, 10) } }
      });
      beds = beds.map(bedObject => bedObject.id);
      let trips = await models.Trip.findAll({
        attributes: ['id'],
        where: { bedId: { [Op.in]: beds }, ...dateFilter },
        include: [{
          model: models.Request,
          as: 'request',
          where: { gender: { [Op.ne]: trip.request.gender }, status: { [Op.ne]: 'Rejected' } }
        }]
      });
      trips = trips.map(tripObject => tripObject.id);
      if (trips.length) {
        return res.status(409).json({
          success: false,
          message: 'Room is currently occupied or booked by the opposite gender'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occurred', 400, res);
    }
  }

  static async checkTripCheckedOut(req, res, next) {
    try {
      const trip = await models.Trip.findById(req.params.tripId);
      if (trip.checkOutDate !== null && trip.checkStatus === 'Checked Out') {
        return res.status(400).json({
          message: 'This trip is already checked out',
          success: false
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return CustomError.handleError('An error occured', 500, res);
    }
  }

  static async validateTripValidator(req, res, next) {
    req.checkBody('trips[*].origin', 'origin is required').ltrim().notEmpty();
    req.checkBody('trips[*].destination', 'destination is required').ltrim().notEmpty();
    req.checkBody('trips[*].departureDate', 'departure date is required').ltrim().notEmpty();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }
}
