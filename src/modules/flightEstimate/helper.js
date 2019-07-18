import models from '../../database/models';
import { role } from '../userRole/__tests__/mocks/mockData';
import mockData from './__tests__/__mocks__/flightEstimateMock';

const {
  userMock, userRole, flightEstimate, countries, travelRegions
} = mockData;

export default class TestSetup {
  static async createTables() {
    await models.User.bulkCreate(userMock);
    await models.Role.bulkCreate(role);
    await models.UserRole.bulkCreate(userRole);
    await models.TravelRegions.bulkCreate(travelRegions);
    await models.Country.bulkCreate(countries);
    await models.FlightEstimate.bulkCreate(flightEstimate);
  }

  static async destroyTables() {
    const destroy = { force: true, truncate: true, cascade: true };
    await models.FlightEstimate.destroy(destroy);
    await models.TravelRegions.destroy(destroy);
    await models.UserRole.destroy(destroy);
    await models.Role.destroy(destroy);
    await models.User.destroy(destroy);
  }
}
