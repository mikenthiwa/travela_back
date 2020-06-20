import { Op } from 'sequelize';
import models from '../../database/models';

export const include = [{
  model: models.User,
  as: 'creator',
  attributes: {
    exclude: [
      'manager', 'occupation', 'department',
      'id', 'createdAt', 'updatedAt',
      'location', 'picture', 'gender', 'passportName'
    ]
  }
}, {
  model: models.ReminderDisableReason,
  as: 'disableReasons',
}];

export const order = [['id', 'DESC'], [{
  model: models.ReminderDisableReason,
  as: 'disableReasons',
}, 'createdAt', 'DESC']];

export const searchEmailTemplates = search => ({
  paranoid: false,
  where: {
    [Op.or]: [
      { name: { [Op.iLike]: `${search}` } },
      { from: { [Op.iLike]: `${search}` } },
      { cc: { [Op.iLike]: `${search}` } },
      { subject: { [Op.iLike]: `${search}` } },
      { message: { [Op.iLike]: `${search}` } },
    ]
  },
});

export const paginateTemplates = async (limit, offset, where) => {
  const templates = await models.ReminderEmailTemplate.findAll({
    where,
    paranoid: false,
    include,
    offset,
    limit,
    order
  });

  return templates;
};

export const paginateWithQuery = async (limit, offset, search) => {
  const templates = await models.ReminderEmailTemplate.findAll({
    order,
    ...searchEmailTemplates(search),
    paranoid: false,
    include,
    limit,
    offset,
  });
  return templates;
};
