const UserHelper = require('../src/helpers/user/index.js');
const db = require('./databaseConnection');

async function createNewUser(bambooUser, location, currentDate) {
  const newUser = await db
    .query(`INSERT INTO "Users" ("fullName", "email", "userId", "passportName", "department", 
      "occupation", "gender", "location", "createdAt", "updatedAt", "bambooHrId") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [
      bambooUser.displayName, bambooUser.workEmail.toLowerCase(), bambooUser.id,
      bambooUser.displayName,
      bambooUser.department, bambooUser.jobTitle, bambooUser.gender, location, currentDate,
      currentDate, bambooUser.id]);
  return newUser;
}
async function migrateUser(bambooUser) {
  try {
    const User = await db
      .query(`SELECT * FROM "Users" WHERE "email" ILIKE '${bambooUser.workEmail}';`);
    if (User.rowCount) {
    // if user exists update user ID
      const updatedUser = await db
        .query(`UPDATE "Users" SET "bambooHrId"=${bambooUser.id} ,
        "email"='${bambooUser.workEmail.toLowerCase()}'
        WHERE "email" ILIKE '${bambooUser.workEmail}';`);
      return updatedUser;
    }

    
    const userLocation = UserHelper.getUserLocation(bambooUser.location);
    const currentDate = new Date().toISOString();
    const location = userLocation || 'Lagos, Nigeria';
    // if user does not exist, create a new user
    const users = await createNewUser(bambooUser, location, currentDate);
    
    const role = 401938;
    const usersRole = await db
      .query(`INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
    VALUES($1, $2, $3, $4)`, [users.rows[0].id, role, currentDate, currentDate]);
    return { users, usersRole };
  } catch (error) {
    if (error.message === 'duplicate key value violates unique constraint "Users_pkey"') {
      return migrateUser(bambooUser);
    }
    throw bambooUser;
  }
}

module.exports = migrateUser;
