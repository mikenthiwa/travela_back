import models from '../../database/models';
import { createSearchClause, getModelSearchColumns, createIncludeSubquery } from '.';

const { Op } = models.Sequelize;
export const getOpenRequestRecords = async (model, userId, search) => {
  let count = 0;
  const searchClause = createSearchClause(
    getModelSearchColumns(model.name),
    search,
    model.name,
  );
  const tripInclude = createIncludeSubquery(models.Trip, search);
  count = await model.count({
    distinct: true,
    where: { status: 'Open', userId, [Op.or]: searchClause },
    include: [{ ...tripInclude[0], where: undefined }],
  });
  if (!count) {
    count = await model.count({
      distinct: true,
      where: { status: 'Open', userId },
      include: tripInclude,
    });
  }
  return count;
};

export const getPastRequestRecords = async (model, userId, search) => {
  let count = 0;
  const searchClause = createSearchClause(
    getModelSearchColumns(model.name),
    search,
    model.name,
  );
  const tripInclude = createIncludeSubquery(models.Trip, search);
  count = await model.count({
    distinct: true,
    where: { status: { [Op.ne]: 'Open' }, userId, [Op.or]: searchClause },
    include: [{ ...tripInclude[0], where: undefined }],
  });
  if (!count) {
    count = await model.count({
      distinct: true,
      where: { status: { [Op.ne]: 'Open' }, userId },
      include: tripInclude,
    });
  }
  return count;
};


const getApprovalRecordsTrips = async (
  model, userId, where, requestSearchClause, include
) => model.count({
  distinct: true,
  where,
  include: [
    {
      model: models.Request,
      as: 'Request',
      where: {
        [Op.or]: requestSearchClause,
      },
      include,
    },
  ],
});

const getBudgetApprovalsTripsWhere = location => (
  {
    [Op.or]: {
      origin: {
        [Op.iLike]: `${location}%`
      },
    }
  }
);

export const getApprovalRecords = where => async (model, userId, search, budgetCheck, location) => {
  let count = 0;
  const requestSearchClause = createSearchClause(
    getModelSearchColumns('Request'),
    search,
    'Request',
  );
  const tripInclude = createIncludeSubquery(models.Trip, search, false);
  const tripsWhere = budgetCheck ? getBudgetApprovalsTripsWhere(location) : {};

  count = await getApprovalRecordsTrips(
    model,
    userId,
    where,
    requestSearchClause, [
      { ...tripInclude[0], where: tripsWhere }
    ]
  );
  return count || getApprovalRecordsTrips(
    model, userId, where, requestSearchClause, [{
      ...tripInclude[0], where: { ...tripInclude[0].where, ...tripsWhere }
    }]
  );
};

export const getOpenApprovalsQuery = (budgetCheck, userId) => {
  const where = {};
  if (budgetCheck) {
    where[Op.and] = {
      budgetStatus: 'Open', status: 'Approved'
    };
  } else {
    where.status = 'Open';
    where.approverId = userId;
  }
  return where;
};

export const getPastApprovalsQuery = (budgetCheck, userId) => {
  const where = {};
  if (budgetCheck) {
    where.budgetStatus = {
      [Op.in]: ['Approved', 'Rejected']
    };
  } else {
    where.status = {
      [Op.ne]: 'Open'
    };
    where.approverId = userId;
  }
  return where;
};

export const getVerifiedRecords = async (model, location, search, status) => {
  const requestSearchClause = createSearchClause(
    getModelSearchColumns('Request'), search, 'Request',
  );
  const tripInclude = createIncludeSubquery(models.Trip, search, false);
  let count = await model.count({
    distinct: true,
    where: { status, budgetStatus: 'Approved' },
    include: [{
      model: models.Request,
      as: 'Request',
      where: { status, [Op.or]: requestSearchClause },
      include: [{ ...tripInclude[0], where: { origin: { [Op.iLike]: `${location}%` } } }],
    }],
  });
  if (!count) {
    const tripWhere = { ...tripInclude[0].where, origin: { [Op.iLike]: `${location}%` } };
    count = await model.count({
      distinct: true,
      where: { status },
      include: [{
        model: models.Request,
        as: 'Request',
        where: { status },
        include: [{ ...tripInclude[0], where: { ...tripWhere } }],
      }],
    });
  }
  return count;
};

export const countByStatus = async (model, userId, search, checkBudget, location) => {
  const count = {};
  if (model.name === 'Approval') {
    count.open = await getApprovalRecords(
      getOpenApprovalsQuery(
        checkBudget, userId
      )
    )(model, userId, search, checkBudget, location);
    count.past = await getApprovalRecords(
      getPastApprovalsQuery(
        checkBudget, userId
      )
    )(model, userId, search, checkBudget, location);
  } else {
    count.open = await getOpenRequestRecords(model, userId, search);
    count.past = await getPastRequestRecords(model, userId, search);
  }
  return count;
};

export const countVerifiedByStatus = async (model, location, search) => {
  const count = {};
  count.approved = await getVerifiedRecords(model, location, search, 'Approved');
  count.verified = await getVerifiedRecords(model, location, search, 'Verified');
  return count;
};

export const getTotalCount = (status, statusCount) => {
  const statusTypeA = ('approved' in statusCount) ? 'approved' : 'open';
  const statusTypeB = ('verified' in statusCount) ? 'verified' : 'past';
  let totalCount = statusCount[statusTypeA] + statusCount[statusTypeB];
  if (status === statusTypeA) totalCount = statusCount[statusTypeA];
  if (status && status !== statusTypeA) totalCount = statusCount[statusTypeB];
  return totalCount;
};
