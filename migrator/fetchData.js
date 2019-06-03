const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const migrateUser = require('./migrate');

const fetchBambooData = async () => {
  try {
    const failedMigrations = [];
    const response = await axios(process.env.BAMBOOHRID_API,
      { headers: { Accept: 'application/json' } });
    const employees = response.data.employees.filter((user) => {
      const invalidUsers = [2048, 1803, 989, 1230, 1344, 2262, 1781, 2553];
      if (invalidUsers.includes(parseInt(user.id, 10))) {
        failedMigrations.push(user);
        return false;
      }
      return true;
    });
    await Promise.all(
      employees.map(async (user) => {
        try {
          await migrateUser(user);
        } catch (bambooUser) {
          failedMigrations.push(bambooUser);
        }
      })
    );
    await fs.writeFile(path.resolve(__dirname, './failedMigrations.json'),
      JSON.stringify(failedMigrations), 'UTF-8');
  } catch (error) {
    return error;
  }
};
 
fetchBambooData();
