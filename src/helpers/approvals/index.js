import models from '../../database/models';
import {
  createSearchClause, getModelSearchColumns
} from '../requests/index';
import UserRoleController from '../../modules/userRole/UserRoleController';
import TravelReadinessUtils from '../../modules/travelReadinessDocuments/TravelReadinessUtils';

const { Op } = models.Sequelize;

export function updateStatus(status) {
  const statuses = {
    approved: 'Approved',
    rejected: 'Rejected',
    verified: 'Verified',
    open: 'Open'
  };
  return statuses[status] || statuses.open;
}


export function updateCondition(status, condition) {
  return (['approved', 'rejected']
    .includes(status.toLowerCase())) ? Op.eq : condition;
}

export const createStatusCondition = (status) => {
  const condition = (status.toLowerCase() === 'open' || status.toLowerCase() === 'verified')
    ? Op.eq : Op.ne;
  return condition;
};

export const createExtendedClause = (verified, location, budgetCheck) => {
  let requestWhereExtended = {};
  let tripWhereExtended = {};
  if (budgetCheck) {
    tripWhereExtended = {
      [Op.or]: {
        origin: {
          [Op.iLike]: `${location}%`
        }
      }
    };
  }

  if (verified) {
    requestWhereExtended = {
      status: { [Op.in]: ['Approved', 'Verified'] },
      budgetStatus: 'Approved'
    };
    tripWhereExtended = {
      origin: {
        [Op.iLike]: `${location}%`
      }
    };
  }
  return { requestWhereExtended, tripWhereExtended };
};

const createPastBudgetApproval = () => ({
  [Op.or]: {
    budgetStatus: {
      [Op.in]: ['Approved', 'Rejected']
    }
  }
});

const createOpenBudgetApproval = () => ({
  [Op.and]: {
    budgetStatus: 'Open',
    status: 'Approved'
  }
});

const createBudgetApproval = (budgetStatus) => {
  const where = {};
  where[Op.or] = {
    status: 'Approved',
    [Op.and]: {
      status: 'Verified',
      budgetStatus: 'Approved'
    }
  };
  if (budgetStatus) {
    where.budgetStatus = budgetStatus;
  }
  return where;
};

function createBudgetApprovalSubQuery({ budgetStatus, checkBudget }) {
  let where = {};
  if (checkBudget) {
    if (budgetStatus === 'Past') {
      where = createPastBudgetApproval();
    } else if (budgetStatus === 'Open') {
      where = createOpenBudgetApproval();
    } else {
      where = createBudgetApproval(budgetStatus);
    }
  } else {
    return null;
  }
  return where;
}

export function createApprovalSubquery({
  req, limit, offset, search, searchRequest
}) {
  const { verified } = req.query;
  const budgetStatus = createBudgetApprovalSubQuery(req.query);
  let status = req.query.status ? req.query.status : '';

  const userName = req.user.UserInfo.name;
  const { location } = req.user;
  // tripWhereExtended
  const { requestWhereExtended, tripWhereExtended } = createExtendedClause(
    verified, location, !!budgetStatus
  );
  const searchClause = createSearchClause(
    getModelSearchColumns('Request'), search, 'Request'
  );
  const tripSearchClause = createSearchClause(
    getModelSearchColumns('Trip'), search
  );
  let condition = createStatusCondition(status);
  const tripWhere = { [Op.or]: tripSearchClause };
  const requestWhere = {
    [Op.or]: searchClause
  };
  let where = (searchRequest) ? { ...requestWhere, ...requestWhereExtended }
    : requestWhereExtended;
  if (status) {
    status = updateStatus(status);
    condition = updateCondition(status, condition);
    where.status = {
      [condition]: status
    };
  }

  if (budgetStatus) {
    if (budgetStatus[Op.or]) {
      where = { ...where, [Op.and]: { [Op.or]: { ...searchClause }, ...budgetStatus } };
    } else where = { ...where, ...budgetStatus };
  }

  const subQuery = {
    where: (verified || budgetStatus) ? {} : { approverId: userName },
    include: [{
      model: models.Request,
      as: `${models.Request.name}`,
      where,
      include: [{
        model: models.Trip,
        as: `${models.Trip.name.toLowerCase()}s`,
        where: (!searchRequest) ? { ...tripWhere, ...tripWhereExtended } : tripWhereExtended,
      }]
    }],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  };
  return subQuery;
}

export const validateBudgetChecker = async (req) => {
  const { params: { requestId } } = req;
  const requestFromDb = await models.Request.findOne({
    where: {
      id: requestId
    }
  });
  const { userId: requesterId } = requestFromDb;
  const user = await models.User.findOne({
    where: {
      userId: requesterId
    }
  });
  const { location: userLocation } = user;
  const budgetChecker = await UserRoleController.findUserDetails(req);
  if (userLocation === budgetChecker.location) {
    return {
      budgetId: budgetChecker.id,
      name: budgetChecker.fullName,
      manager: budgetChecker.manager,
      result: true
    };
  }
  return { result: false };
};

export const getTravelTeamEmailData = async (
  request,
  requesterName,
  type = 'Notify Travel Admins of Manager Approval',
  topic = 'Manager Approval'
) => {
  const { id, name } = request;
  const trips = await models.Trip.findAll({ where: { requestId: id } });
  if (trips) {
    const locations = trips.reduce((tripLocations, trip) => {
      tripLocations.push(trip.origin, trip.destination);
      return tripLocations;
    }, []).map(location => location.split(',')[0]);

    const { users: travelAdmin } = await UserRoleController.calculateUserRole('29187');
    const travelAdmins = await TravelReadinessUtils.getRoleMembers(travelAdmin, locations);

    const data = {
      sender: requesterName,
      topic,
      type,
      details: { requestId: id, requesterName: name },
      redirectLink: `${process.env.REDIRECT_URL}/requests/my-verifications/${id}`
    };
    return travelAdmins.length ? { travelAdmins, data } : null;
  }
  return null;
};
