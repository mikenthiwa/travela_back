import cron from 'node-cron';
import debug from 'debug';
import axios from 'axios';
import path from 'path';
import moment from 'moment';
import UserQuery from './UserQuery';
import BambooHelpers from './helpers/bambooHelper';

const fs = require('fs').promises;

const logger = debug('log');
const failedUpdates = [];

class updateUserCron {
  static userUpdate() {
    const task = cron.schedule(
      '0 0 * * *',
      () => {
        updateUserCron.fetchChangedProfiles();
      },
      {
        scheduled: true,
        timezone: 'Africa/Nairobi'
      }
    );
    task.start();
  }

  static async userQuery(data, action) {
    let message;
    let failMessage;
    let query;
    if (action === 'Insert') {
      message = `Creating a new user with ID ${data.id}...`;
      failMessage = `Failed to create a new user with ID ${data.id}`;
      query = UserQuery.createOrUpdate(data);
    } else if (action === 'Update') {
      message = `Updating user with ID ${data.id}'s details.....`;
      failMessage = `Failed to update user with ID ${data.id}'s details`;
      query = UserQuery.updateUser(data);
    } else {
      message = `Flagging user with ID ${data.id} as deleted.....`;
      failMessage = `Failed to flag user with ID ${data.id} as deleted`;
      query = UserQuery.flagDeletedUser(data);
    }
    logger(message);
    try {
      await query;
    } catch (error) {
      const failedData = {
        ...data,
        failedAction: action
      };
      logger(failMessage);
      failedUpdates.push(failedData);
    }
  }

  static async switchActions(bambooData, action) {
    switch (action) {
      case 'Inserted':
        await updateUserCron.userQuery(bambooData, 'Insert');
        break;
      case 'Updated':
        await updateUserCron.userQuery(bambooData, 'Update');
        break;
      case 'Deleted':
        await updateUserCron.userQuery(bambooData, 'Delete');
        break;
      default:
        break;
    }
  }

  static async fetchChangedProfiles() {
    logger('User data update is starting.....');
    try {
      const yesterdayDate = moment(new Date(Date.now() - 864e5)).format('YYYY-MM-DDTHH:mm:ss%2B03:00');
      const response = await axios.get(
        process.env.LASTCHANGED_BAMBOO_API.replace('{yesterdayDate}', yesterdayDate),
        { headers: { Accept: 'application/json' } }
      );
      const { employees } = response.data;
      await Promise.all(
        Object.keys(employees).map(async (key) => {
          try {
            const user = employees[key];
            let bambooData;
            if (user.action === 'Deleted') {
              bambooData = {
                id: user.id
              };
            } else {
              bambooData = await BambooHelpers.getBambooUser(parseInt(user.id, 10));
            }
            await updateUserCron.switchActions(bambooData, user.action);
          } catch (error) {
            logger(error.message);
          }
        })
      );
      await fs.writeFile(path.resolve(__dirname, './failedUserUpdate.json'),
        JSON.stringify(failedUpdates), 'UTF-8');
      logger('Completed user data update');
    } catch (error) {
      logger(`An error occurred while running the update : ${error.message}`);
    }
  }
}
export default updateUserCron;
