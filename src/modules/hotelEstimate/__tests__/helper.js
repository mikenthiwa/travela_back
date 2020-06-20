import models from '../../../database/models';
import { role } from '../../userRole/__tests__/mocks/mockData';
import mockData from './__mocks__/hotelEstimateMock';

const {
  userMock, userRole, hotelEstimate, countries, travelRegions
} = mockData;

export default class TestSetup {
  static async createTables() {
    await models.Role.bulkCreate(role);
    await models.User.bulkCreate(userMock);
    await models.UserRole.bulkCreate(userRole);
    await models.TravelRegions.bulkCreate(travelRegions);
    await models.Country.bulkCreate(countries);
    await models.HotelEstimate.bulkCreate(hotelEstimate);
  }

  static async destoryTables() {
    await models.HotelEstimate.destroy({ truncate: true, cascade: true });
    await models.User.destroy({ truncate: true, cascade: true });
    await models.Country.destroy({ truncate: true, cascade: true });
    await models.TravelRegions.destroy({ truncate: true, cascade: true });
    await models.UserRole.destroy({ force: true, truncate: { cascade: true } });
    await models.Role.destroy({ force: true, truncate: { cascade: true } });
  }
}
