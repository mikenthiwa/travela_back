import _ from 'lodash';
import models from '../../database/models';
import Pagination from '../../helpers/Pagination';
import UserRoleController from '../userRole/UserRoleController';
import TravelChecklistController from '../travelChecklist/TravelChecklistController';

const { Op } = models.Sequelize;

const whereObject = {
  whereTrip: centers => ({ [Op.iRegexp]: { [Op.any]: centers } }),
  whereApproved: { status: 'Approved', budgetStatus: 'Approved' },
  whereVerified: { status: 'Verified' },
  whereSearch: (searchString, whereStatus) => ({
    ...whereStatus,
    $or: [
      { id: { $iLike: `%${searchString}%` } },
      { name: { $iLike: `%${searchString}%` } },
      { department: { $iLike: `%${searchString}%` } }
    ]
  }),
  whereRequest: (status, search) => {
    const value = {
      approved: whereObject.whereApproved,
      verified: whereObject.whereVerified,
      undefined: { status: { [Op.in]: ['Approved', 'Verified', 'Open'] } },
    };
    return search ? whereObject.whereSearch(search, value[status]) : value[status];
  },
  whereTrips: (centers, flow = 'origin') => ([
    {
      model: models.Trip,
      where: { [`${flow}`]: whereObject.whereTrip(centers) },
      as: 'trips'
    }
  ])
};

class TravelAdminApprovalController {
  static handleResponse(res, approvals, meta, search = '') {
    const message = approvals.length < 1
      ? 'You have no approvals at the moment'
      : 'Approvals retrieved successfully';
    return res.status(200).json({
      success: true,
      message: search && !approvals.length ? 'No records found' : message,
      approvals,
      meta,
    });
  }

  static async getTravelAdminRequest(req, res) {
    try {
      const {
        status, search, center, flow
      } = req.query;
      const user = await UserRoleController.findUserDetails(req);
      const centers = TravelAdminApprovalController.getAdminCenter(user);
      const message = 'You dont have any center Assigned to you';

      if (centers.length < 1) {
        return res.status(200).json({
          success: true,
          approvals: [],
          message,
          meta: {
            count: { approved: 0, verified: 0 },
            pagination: { pageCount: 0, currentPage: 1, dataCount: 0 },
            centers: []
          }
        });
      }
      const { page, limit, offset } = await Pagination.initializePagination(req);
      const includeQuery = whereObject.whereTrips(center ? [center] : centers, flow);
      const requests = await models.Request.findAndCountAll({
        offset,
        limit,
        where: { ...whereObject.whereRequest(status, search) },
        distinct: true,
        include: includeQuery,
        order: [['createdAt', 'DESC']]
      });

      const pagination = Pagination.getPaginationData(page, limit, requests.count);
      const approved = await TravelAdminApprovalController.calculateTravelApprovals(
        whereObject.whereRequest('approved', search),
        includeQuery
      );
      const verified = await TravelAdminApprovalController.calculateTravelApprovals(
        whereObject.whereRequest('verified', search),
        includeQuery
      );
      const approvals = await TravelAdminApprovalController.getChecklistPercentage(
        requests,
        req,
        res
      );
      const meta = { count: { approved, verified }, pagination, centers };
      return TravelAdminApprovalController.handleResponse(res, approvals, meta, search);
    } catch (error) { /* istanbul ignore next */
      return res.status(400).json({ error });
    }
  }

  static async getChecklistPercentage(requests, req, res) {
    return Promise.all(
      requests.rows.map(async (request) => {
        const travelCompletion = await TravelChecklistController.checkListPercentage(
          req,
          res,
          request.id
        );
        request.dataValues.travelCompletion = travelCompletion;
        return request;
      })
    );
  }

  static getAdminCenter(data) {
    const myRoles = ['Super Administrator', 'Travel Administrator', 'Travel Team Member'];
    const checkCenters = data.roles.map(roles => myRoles.map((myRole) => {
      const centerArray = [];
      if (roles.roleName === myRole) {
        centerArray.push(roles.centers.map(center => center.location));
      }
      return centerArray;
    }));
    const flat = _.flattenDepth(checkCenters, 3);
    const centers = [...new Set(flat)];
    return centers;
  }

  static async calculateTravelApprovals(whereQuery, includeQuery) {
    const result = await models.Request.count({
      where: {
        ...whereQuery
      },
      distinct: true,
      include: includeQuery
    });
    return result;
  }
}

export default TravelAdminApprovalController;
