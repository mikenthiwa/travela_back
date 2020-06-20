import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import {
  travelAdmin,
  travelAdminRole,
  requester,
  requesterRole,
} from '../../travelReadinessDocuments/__tests__/__mocks__/index';


export default class TestSetup {
  static async createTables() {
    await models.Role.bulkCreate(role);
    await models.User.create(travelAdmin);
    await models.User.create(requester);
    await models.UserRole.bulkCreate(travelAdminRole);
    await models.UserRole.create(requesterRole);
  }

  static async destoryTables() {
    await models.User.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.ReminderEmailTemplate.destroy({ force: true, truncate: { cascade: true } });
  }
}
