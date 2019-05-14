import { Parser } from 'json2csv';
import models from '../../../database/models';
import Error from '../../../helpers/Error';
import Utils from '../../../helpers/Utils';

const { Op } = models.Sequelize;
class TripsController {
  static generateAnalysis(trips) {
    const report = [];
    trips.forEach((trip) => {
      const reportItem = {
        label: trip.department,
        value: trip.totalTrips || 0
      };
      report.push(reportItem);
    });
    return report;
  }

  static async getTripsPerMonth(req, res) {
    const { center, firstDate, lastDate } = req.query;
    const { regex } = await Utils.checkAdminCenter(req, center);

    try {
      const trips = await models.Request.findAll({
        group: ['department'],
        raw: true,
        attributes: [
          'department',
          [models.sequelize.fn('COUNT', models.sequelize.col('trips.id')), 'totalTrips']],
        where: { status: { [Op.ne]: 'Rejected' } },
        include: [{
          model: models.Trip,
          where: {
            origin: {
              [Op.iRegexp]: `(${regex})`
            },
            departureDate: {
              [Op.gte]: new Date(firstDate),
              [Op.lte]: new Date(lastDate)
            }
          },
          as: 'trips',
          attributes: []
        }]
      });
      const report = TripsController.generateAnalysis(trips);
      if (req.query.type === 'file') {
        const fields = ['label', 'value'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(report);
        return res.attachment('Departmental Trips Per Month Report.csv').send(csv);
      }
      return res.status(200).json({ success: true, data: report });
    } catch (error) { /* istanbul ignore next */
      return Error.handleError(error.toString(), 500, res);
    }
  }
}

export default TripsController;
