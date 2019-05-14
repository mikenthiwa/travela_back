import _ from 'lodash';
import moment from 'moment';
import archiver from 'archiver';
import fs from 'fs';
import { Parser } from 'json2csv';
import models from '../../../database/models';
import Error from '../../../helpers/Error';
import Utils from '../../../helpers/Utils';
import TravelAdminApprovalController from '../../approvals/TravelAdminApprovalController';
import UserRoleController from '../../userRole/UserRoleController';

const { Op } = models.Sequelize;
class AnalyticsController {
  static getCount(value) {
    const result = value.reduce((i, j) => Object.assign(i, { [j]: (i[j] || 0) + 1 }), {});
    return result;
  }

  static getResult(count) {
    const results = [];
    Object.keys(count).forEach((key) => {
      results.push({ name: key, value: count[key] });
    });
    return results;
  }

  static async getRequestFromDb(query) {
    const requests = await models.Request.findAndCountAll({ ...query });
    return requests;
  }

  static async leadTime(center, dateQuery) {
    const allTrips = await AnalyticsController.getAllTrips(center, dateQuery);
    const alltripDetails = allTrips.rows.map(trip => trip.trips);
    const requestDates = allTrips.rows.map(trip => moment(trip.createdAt).format('YYYY-MM-DD'));
    const departDates = alltripDetails.map(trip => trip.map(departure => departure.departureDate));
    const minDepart = departDates.map(dep => _.max(dep));
    const convertLeadTimeToString = minDepart.map((x, i) => {
      const leadTimeToString = new Date(x) - new Date(requestDates[i]);
      const leadTimeResult = leadTimeToString / (1000 * 3600 * 24) + 1;
      const leadTimeDuration = `${leadTimeResult.toString()} days`;
      return leadTimeDuration;
    });
    const getCountOfLeadDuration = AnalyticsController.getCount(convertLeadTimeToString);
    let leadTimeduration = AnalyticsController.getResult(getCountOfLeadDuration);
    if (leadTimeduration.length === 0) {
      leadTimeduration = [{ name: '', value: '' }];
    }
    return leadTimeduration;
  }

  static isLocationInTrips(trips, key, center) {
    const regexCity = new RegExp(`${center}`, 'i');
    const found = trips.findIndex(trip => regexCity.test(trip[`${key}`]));
    const isFound = found >= 0;
    return isFound;
  }

  static async getPendingRequests(center, dateQuery) {
    const pendingRequestsQuery = {
      include: [
        {
          model: models.Trip,
          as: 'trips',
          where: { origin: { [Op.iRegexp]: `(${center})` }, departureDate: dateQuery }
        }
      ],
      where: { status: 'Approved' }
    };
    return pendingRequestsQuery;
  }

  static async getAllTrips(center, dateQuery) {
    const where = {
      [Op.and]: [
        { departureDate: { [Op.ne]: null } },
        { origin: { [Op.iRegexp]: `(${center})` } },
        { departureDate: dateQuery }
      ]
    };
    const query = {
      include: [{ model: models.Trip, as: 'trips', where }]
    };
    const allTrips = await AnalyticsController.getRequestFromDb(query);
    return allTrips;
  }

  static async getPeopleRequests(center, dateQuery) {
    const where = {
      [Op.or]: {
        destination: { [Op.iRegexp]: `(${center})` },
        origin: { [Op.iRegexp]: `(${center})` }
      },
      departureDate: dateQuery
    };
    const query = {
      include: [{ model: models.Trip, as: 'trips', where }]
    };
    const peopleRequests = await AnalyticsController.getRequestFromDb(query);
    const peopleLeaving = peopleRequests.rows.filter(
      request => this.isLocationInTrips(request.trips, 'origin', center)
    );
    const peopleVisiting = peopleRequests.rows.filter(
      request => this.isLocationInTrips(request.trips, 'destination', center)
    );
    return { allRequests: peopleRequests, peopleLeaving, peopleVisiting };
  }

  static async getRequestsDuration(dateQuery, center) {
    const query = {
      include: [
        {
          model: models.Trip,
          required: true,
          as: 'trips',
          where: { origin: { [Op.iRegexp]: `(${center})` }, departureDate: dateQuery }
        }
      ],
      where: { tripType: { [Op.ne]: 'oneWay' } }
    };
    const requestsWithReturnDate = await AnalyticsController.getRequestFromDb(query);
    const durations = requestsWithReturnDate.rows.map((request) => {
      const depatureDates = request.trips.map(trip => new Date(trip.departureDate));
      const returnDates = request.trips.map(trip => new Date(trip.returnDate));
      const minDeparture = _.min(depatureDates);
      const maxReturn = _.max(returnDates);
      const durationToDay = (maxReturn - minDeparture) / (1000 * 3600 * 24) + 1; // eslint-disable-line
      const day = durationToDay > 0 && `${durationToDay.toString()} days`;
      return day;
    });

    const getCountOfDuration = AnalyticsController.getCount(_.compact(durations));
    let durationsResult = AnalyticsController.getResult(getCountOfDuration);
    if (durationsResult.length === 0) {
      durationsResult = [{ name: '', value: '' }];
    }
    return { durationsResult, requestsWithReturnDate };
  }

  static async convertToCsv(response, defaultResponse) {
    const travelFields = ['totalRequests', 'pendingRequests', 'peopleVisiting', 'peopleLeaving'];
    const averageDurationFields = [
      'travelDurationBreakdown.durations.name',
      'travelDurationBreakdown.durations.value'
    ];
    const averageLeadtimeFields = [
      'travelLeadTimeBreakdown.leadTimes.name',
      'travelLeadTimeBreakdown.leadTimes.value'
    ];
    const travelJson2csvParser = new Parser({ travelFields });
    const durationJson2csvParser = new Parser({ averageDurationFields });
    const leadtimeJson2csvParser = new Parser({ averageLeadtimeFields });
    const travelCsv = travelJson2csvParser.parse(defaultResponse);
    const durationCsv = durationJson2csvParser.parse(response.travelDurationBreakdown.durations);
    const leadtimeCsv = leadtimeJson2csvParser.parse(response.travelLeadTimeBreakdown.leadTimes);
    const objectOfFiles = {
      'Travel Analysis Report.csv': travelCsv,
      'Average Travel Duration.csv': durationCsv,
      'Average Travel Lead Time.csv': leadtimeCsv
    };
    return objectOfFiles;
  }

  static async zipFile(objectOfFiles, res) {
    const output = fs.createWriteStream('Analytics.zip');
    output.on('close', () => {
      res.download('Analytics.zip');
    });
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);
    await Object.keys(objectOfFiles).map(async (filename) => {
      const writeStream = fs.createWriteStream(filename);
      await writeStream.once('open', async () => {
        await writeStream.write(objectOfFiles[filename]);
        writeStream.end();
      });
    });
    await Object.keys(objectOfFiles).map(async (filename) => {
      await archive.file(filename);
    });
    archive.finalize();
  }

  static async dateQuery(dateFrom, dateTo) {
    const dateQuery = {};
    if (!dateFrom && !dateTo) dateQuery[Op.ne] = null;
    if (dateFrom) dateQuery[Op.gte] = dateFrom;
    if (dateTo) dateQuery[Op.lte] = dateTo;
    return dateQuery;
  }

  static async report(req, res, defaultResponse, response) {
    if (req.query.type === 'file') {
      const objectOfFiles = await AnalyticsController.convertToCsv(response, defaultResponse);
      await AnalyticsController.zipFile(objectOfFiles, res);
    } else {
      return res.status(200).json({ success: true, data: response });
    }
  }

  static async analytics(req, res) {
    try {
      const { dateFrom, dateTo, center } = req.query;
      const dateQuery = await AnalyticsController.dateQuery(dateFrom, dateTo);
      const { regex } = await Utils.checkAdminCenter(req, center);

      const user = await UserRoleController.findUserDetails(req);
      const userCenters = await TravelAdminApprovalController.getAdminCenter(user);
      const pendingRequestsQuery = await AnalyticsController.getPendingRequests(regex, dateQuery);
      const pendingRequests = await AnalyticsController.getRequestFromDb(pendingRequestsQuery);
      const peopleRequests = await AnalyticsController.getPeopleRequests(regex, dateQuery);
      const { durationsResult, requestsWithReturnDate } = await AnalyticsController.getRequestsDuration(dateQuery, regex);
      const leadTripDetails = await AnalyticsController.leadTime(regex, dateQuery, res);
      const {
        allRequests: { count },
        peopleVisiting,
        peopleLeaving
      } = peopleRequests;

      const defaultResponse = {
        totalRequests: count,
        pendingRequests: pendingRequests.count,
        peopleVisiting: peopleVisiting.length,
        peopleLeaving: peopleLeaving.length,
        userCenters
      };
      const response = {
        ...defaultResponse,
        travelDurationBreakdown: {
          durations: durationsResult,
          total: requestsWithReturnDate.count
        },
        travelLeadTimeBreakdown: { leadTimes: leadTripDetails, total: leadTripDetails.length }
      };
      await AnalyticsController.report(req, res, defaultResponse, response);
    } catch (error) {
      /* istanbul ignore next */
      return Error.handleError(error.toString(), 500, res);
    }
  }
}

export default AnalyticsController;
