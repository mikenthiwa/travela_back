import moxios from 'moxios';
import moment from 'moment';
import models from '../../../database/models';
import updateUserCron from '../updateUserCron';
import {
  existingUsers,
  users,
  userChanges
} from './mocks/mockData';
import BambooHelpers from '../helpers/bambooHelper';

const mockFetchBambooUser = (userId) => {
  moxios.stubRequest(process.env.BAMBOOHR_API.replace('{bambooHRId}', userId), {
    status: 200,
    response: users.find(user => parseInt(user.id, 10) === userId)
  });
};

describe('Cron job should update user profiles accordingly', () => {
  beforeAll(async () => {
    await models.UserRole.destroy({ cascade: true, truncate: true });
    await models.User.destroy({ cascade: true, truncate: true });
    await models.User.bulkCreate(existingUsers);
    updateUserCron.userUpdate = jest.fn();
    BambooHelpers.handleBambooError = jest.fn();
  });
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  afterAll(async () => {
    await models.UserRole.destroy({ cascade: true, truncate: true });
    await models.User.destroy({ cascade: true, truncate: true });
  });

  it('It fetch changes from last changed bamboo api', async () => {
    const date = new Date(Date.now() - 864e5);
    const yesterdayDate = moment(date).format('YYYY-MM-DDTHH:mm:ss%2B03:00');
    moxios.stubRequest(
      process.env.LASTCHANGED_BAMBOO_API.replace(
        '{yesterdayDate}',
        yesterdayDate
      ),
      {
        status: 200,
        response: {
          employees: userChanges
        }
      }
    );
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(id => mockFetchBambooUser(id));
    await updateUserCron.fetchChangedProfiles();
  });
  it('should run the cron job', () => {
    updateUserCron.userUpdate();
    expect(updateUserCron.userUpdate).toHaveBeenCalled();
  });
});
