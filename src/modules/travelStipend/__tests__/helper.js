import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import mockData from './__mocks__/travelStipendMock';

const {
  user, userRole, centers, listOfStipends, regions
} = mockData;

export default class TestSetup {
  static async createTables() {
    await models.User.bulkCreate(user);
    await models.Role.bulkCreate(role);
    await models.Center.bulkCreate(centers);
    await models.TravelRegions.bulkCreate(regions);
    await models.UserRole.bulkCreate(userRole);
    await models.TravelStipends.bulkCreate(listOfStipends);
  }

  static async destoryTables() {
    await models.TravelStipends.destroy({ force: true, truncate: { cascade: true } });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Center.destroy({ truncate: true, cascade: true });
    await models.Role.destroy({ truncate: { cascade: true }, force: true });
    await models.User.destroy({ truncate: { cascade: true }, force: true });
    await models.TravelRegions.destroy({ truncate: true, cascade: true });
  }
}
