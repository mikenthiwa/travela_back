/* eslint-disable import/no-named-default */
import { Parser } from 'json2csv';
import _ from 'lodash';

import models from '../../../database/models';
import Error from '../../../helpers/Error';
import Pagination from '../../../helpers/Pagination';
import fields from './fields';
import Utils from './utils';
import TravelCalendarError from '../../../exceptions/travelCalendarExceptions';
import { srcRequestWhereClause } from '../../../helpers/requests';
import { default as HelperUtils } from '../../../helpers/Utils';

const { Op } = models.Sequelize;

class CalendarController {
  static async queryDB(query) {
    const data = await models.Request.findAndCountAll({ ...query });
    return data;
  }

  static dateQuery(dateFrom, dateTo) {
    const dateQuery = {};
    if (!dateFrom && !dateTo) dateQuery[Op.ne] = null;
    if (dateFrom && dateTo) {
      dateQuery[Op.or] = {
        [Op.or]: [dateFrom, dateTo], [Op.between]: [dateFrom, dateTo]
      };
    }
    return dateQuery;
  }


  static async getRequestDetails(center, dateFrom, dateTo) {
    const dateQuery = await CalendarController.dateQuery(dateFrom, dateTo);
    const query = {
      raw: true,
      where: srcRequestWhereClause,
      attributes: ['id', 'name', 'department', 'role', 'picture', 'tripType'],
      order: [['id', 'ASC']],
      include: [{
        model: models.Trip,
        as: 'trips',
        attributes: ['origin', 'destination', 'departureDate', 'returnDate'],
        where: {
          [Op.and]: [
            { [Op.or]: [{ origin: { [Op.iRegexp]: `(${center})` } }, { destination: { [Op.iRegexp]: `(${center})` } }] },
            { [Op.or]: [{ departureDate: dateQuery }, { returnDate: dateQuery }] },
          ]
        },
        include: [{
          model: models.ChecklistSubmission,
          as: 'submissions',
          where: { checklistItemId: '1' },
          attributes: ['value']
        }],
      }]
    };
    const requestDetails = await CalendarController.queryDB(query, 'request');
    return requestDetails;
  }

  static getTravelDetails(location, requestDetails) {
    if (requestDetails.length > 0) {
      const multiTrips = _.remove(requestDetails, request => (request.tripType === 'multi'));
      const multiTripsData = Utils.handleMultiTrips(location, multiTrips);
      const flightDetails = requestDetails.map((details) => {
        const {
          name, department, role, picture, tripType
        } = details;
        const ticket = JSON.parse(details['trips.submissions.value']);
        const flight = Utils.handleDestinations(location, tripType, details['trips.origin'],
          details['trips.destination'], ticket);
        return {
          name, department, role, picture, flight
        };
      });
      return _.concat(flightDetails, multiTripsData);
    }
    throw new TravelCalendarError('No records found', 404);
  }

  static async convertTocsvFile(res, response, type) {
    if (type === 'file') {
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(response.data);
      return res.status(200).attachment('Travel Calendar Analytics.csv').send(csv);
    }
    return res.status(200).json(response);
  }

  static async getTravelCalendarAnalytics(req, res) {
    try {
      const {
        type, location, dateFrom, dateTo, page, limit
      } = req.query;
      const setLimit = limit || 3;
  
      const { regex, centers } = await HelperUtils.checkAdminCenter(req, location);

      const { data, pagination } = await CalendarController.getDataAndPagination({
        setLimit, regex, dateFrom, dateTo, page, centers
      });

      await CalendarController.checkData({
        data, pagination, res, type
      });
    } catch (error) {
      if (error instanceof TravelCalendarError) {
        return Error.handleError(error.message, error.status, res);
      }
      /* istanbul ignore next */
      return Error.handleError(error, 500, res);
    }
  }

  static async getDataAndPagination({
    setLimit, regex, dateFrom, dateTo, page, centers
  }) {
    const requestDetails = await CalendarController.getRequestDetails(regex, dateFrom, dateTo);
    const allData = CalendarController.getTravelDetails(centers, requestDetails.rows);
    const pagination = Pagination.getPaginationData(page, setLimit, allData.length);
    pagination.limit = setLimit;
    pagination.nextPage = pagination.currentPage + 1;
    pagination.prevPage = pagination.currentPage - 1;
    const data = Utils.handlePagination(allData, setLimit, page);
    return { data, pagination };
  }

  static async checkData({
    data, pagination, res, type
  }) {
    if (data.length) {
      const response = { data, pagination };
      await CalendarController.convertTocsvFile(res, response, type);
    } else {
      throw new TravelCalendarError('No records found', 404);
    }
  }
}

export default CalendarController;
