
import models from '../database/models';
import Validator from './Validator';

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
      return res.status(400).json({
        success: false,
        message: 'An error occurred'
      });
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
          success: false,
          message: 'You don\'t have access to this trip'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }

  static async checkTripApproved(req, res, next) {
    const { tripId } = req.params;
    const userId = req.user.UserInfo.id;
    try {
      const trip = await models.Trip.findOne({
        where: { id: tripId },
        include: [{
          required: true,
          model: models.Request,
          as: 'request',
          where: { userId, status: 'Approved' },
        }]
      });
      if (!trip) {
        return res.status(400).json({
          success: false,
          message: 'This trip is not approved'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({
        success: false,
        message: 'An error occurred'
      });
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
      res.status(400).json({
        success: false,
        message: 'User not found in database'
      });
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
    try {
      const bed = await models.Bed.findById(req.body.bedId);
      if (!bed) {
        return res.status(400).json({
          success: false,
          message: 'Bed does not exist'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({
        success: false,
        message: 'An error occurred'
      });
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
        return res.status(400).json({
          success: false,
          message: 'Bed is currently unavailable'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }

  static async isRoomFaulty(req, res, next) {
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
      return res.status(400).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }

  static async isGenderAllowed(req, res, next) {
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
          where: { gender: { [Op.ne]: trip.request.gender } }
        }]
      });
      trips = trips.map(tripObject => tripObject.id);
      if (trips.length) {
        return res.status(400).json({
          success: false,
          message: 'Room is currently occupied by the opposite sex'
        });
      }
      next();
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({
        success: false, message: 'An error occurred'
      });
    }
  }
}
