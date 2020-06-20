import moment from 'moment';
import { Op } from 'sequelize';
import models from '../database/models';
import Validator from './Validator';

class GuestHouseValidator {
  static async checkRoom(req, res, next) {
    const room = await models.Room.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!room) {
      return res.status(404).send({
        success: false,
        message: 'The room does not exist'
      });
    }
    next();
  }

  static async checkMaintenanceRecord(req, res, next) {
    const maintenanceRecord = await models.Maintainance.findOne({
      where: {
        roomId: req.params.id
      }
    });
    if (!maintenanceRecord) {
      return res.status(404).json({
        success: false,
        message: 'The maintenance record does not exist'
      });
    }
    next();
  }

  static checkFaultRoomStatus(req, res, next) {
    const { body: { fault } } = req;
    if (fault !== true && fault !== false) {
      return res.status(400).json({
        success: false,
        message: 'Room status can only be true or false'
      });
    }
    next();
  }

  static async validateGuestHouse(req, res, next) {
    req.checkBody('houseName', 'House name is required').notEmpty();
    req.checkBody('location', 'Location is required').notEmpty();
    req.checkBody('bathRooms', 'bathRooms is required and must be a Number')
      .isInt();
    req.checkBody('imageUrl', 'Image Url is required').notEmpty();
    req.checkBody('rooms.*.roomName', 'Room Name is required').notEmpty();
    req.checkBody('rooms.*.roomType', 'Room Type is required').notEmpty();
    req.checkBody('rooms.*.bedCount', 'Number of beds is required and must be a number').isInt();
    req.checkBody('genderPolicy', 'Gender Policy is required').trim().notEmpty();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static validateMaintainanceRecord(req, res, next) {
    req.checkBody('reason', 'Maintainace reason is required').notEmpty();
    req.checkBody('start', 'start date must be provided').notEmpty();
    req.checkBody('start', 'start date must be formatted correcty mm/dd/yyyy')
    .matches(/^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]((?:19|20)\d\d)$/); /* eslint-disable-line*/
    req.checkBody('end', 'Maintainance end data must be provided').notEmpty();
    req.checkBody('end', 'end date must be formatted correcty mm/dd/yyyy')
    .matches(/^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]((?:19|20)\d\d)$/); /* eslint-disable-line*/
    req.checkBody('start', 'end date should be greater than start date').custom((start) => {
      const dateStart = new Date(start);
      const dateEnd = new Date(req.body.end);
      return dateEnd >= dateStart;
    });
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static checkDate(req, res, next) {
    const { startDate, endDate } = req.query;
    if (!startDate && !endDate) return next();
    const isValidStartDate = moment(startDate, 'YYYY-MM-DD', true).isValid();
    const isValidEndDate = moment(endDate, 'YYYY-MM-DD', true).isValid();

    if (!isValidStartDate || !isValidEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date or end date'
      });
    }
    next();
  }

  static async validateGuestHouseDataSet(req, res, next) {
    const { houseName, rooms } = req.body;
    const houseNameExists = await GuestHouseValidator.getGuestHouseFromDb({ houseName: { [Op.iLike]: `%${houseName}%` } });
    const availableGuestHouses = JSON.parse(JSON.stringify(houseNameExists));

    if (req.method === 'PUT') {
      const guestHouseId = req.params.id;
      const originalGuestHouse = await GuestHouseValidator.getGuestHouseFromDb({ id: guestHouseId });
      const theOriginalGuestHouse = JSON.parse(JSON.stringify(...originalGuestHouse));
      if (availableGuestHouses.find(house => house.houseName === theOriginalGuestHouse.houseName)) {
        availableGuestHouses.splice(availableGuestHouses.indexOf(theOriginalGuestHouse));
      }
    }
    if (availableGuestHouses.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kindly use another name, this guesthouse name already exists'
      });
    }

    // rooms validation
    const roomExists = rooms.find(indexRoom => GuestHouseValidator.ifRoomPresent(indexRoom, rooms));
    if (roomExists) {
      return res.status(400).json({
        success: false,
        message: 'Kindly use another name, this room name already exists for this guest house'
      });
    }
    next();
  }

  static validateGenderPolicy(req, res, next) {
    const { genderPolicy } = req.body;
    const acceptedOptions = ['unisex', 'male', 'female'];
    if (!acceptedOptions.includes(genderPolicy.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Gender policy should be either unisex, male or female'
      });
    }
    next();
  }

  static ifRoomPresent(indexRoom, rooms) {
    const resultRooms = rooms.filter(eachRoom => indexRoom.roomName.toLowerCase() === eachRoom.roomName.toLowerCase());
    return resultRooms.length > 1;
  }

  static async getGuestHouseFromDb(condition) {
    const query = { where: condition };
    const guestHouse = await models.GuestHouse.findAll(query);
    return guestHouse;
  }

  static validateAvailableRooms(req, res, next) {
    const { query: { departureDate, arrivalDate } } = req;
    req.checkQuery('gender', 'The gender is required').notEmpty();
    req.checkQuery('departureDate', 'The departure date is required').notEmpty();
    req.checkQuery('location', 'The location is required').notEmpty();
    req.checkQuery('arrivalDate', 'The arrival date is required').notEmpty();

    if (arrivalDate) {
      req.checkQuery('arrivalDate', 'The arrival date is invalid')
        .custom(date => moment(date, 'YYYY-MM-DD', true).isValid());
    }

    if (departureDate) {
      req.checkQuery('departureDate', 'The departure date is invalid')
        .custom(date => moment(date, 'YYYY-MM-DD', true).isValid());
    }
    if (arrivalDate && departureDate) {
      req.checkQuery('departureDate', 'Departure date should be less than arrival date.')
        .custom(date => (
          new Date(date) <= new Date(arrivalDate)
        ));
    }

    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async validateImage(req, res, next) {
    const reg = /[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%“\,\{\}\\|\\\^\[\]`]+)?$/; /* eslint-disable-line*/
    const checkUrl = reg.test(req.body.imageUrl);
    if (!checkUrl) {
      return res.status(400).json({
        success: false, message: 'Only Url allowed for Image'
      });
    }
    next();
  }
}

export default GuestHouseValidator;
