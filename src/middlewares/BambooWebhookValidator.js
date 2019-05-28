import dotenv from 'dotenv';
import debug from 'debug';
import Error from '../helpers/Error';
import Validator from './Validator';
import UserHelper from '../helpers/user';
import UserQuery from '../modules/bamboohr/UserQuery';

dotenv.config();
const {
  BAMBOOHR_SECRET_KEY,
} = process.env;

const logger = debug('log');

class BambooWebhookValidator {
  static dataValidator(req, res, next) {
    req.check('key', 'Please enter a secret key')
      .trim().notEmpty();
    req.check('employees', 'There is no employee data')
      .trim().notEmpty();
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static validateSecretKey(req, res, next) {
    const { key } = req.params;
    const keyVerified = key === BAMBOOHR_SECRET_KEY;
    req.check(
      'key',
      'Secret key is invalid'
    ).custom(() => keyVerified);
    const errors = req.validationErrors();
    Validator.errorHandler(res, errors, next);
  }

  static async validateBambooUsers(req, res, next) {
    const { employees } = req.body;
    let invalidEmployees;
    let validEmployees;

    logger(`Employee Array from BambooHr : ${employees}`);
    try {
      invalidEmployees = employees.map(async (employee) => {
        const bambooUserData = await UserHelper.getUserOnBamboo(employee.id);
        if (!bambooUserData.data) return employee.id;
      });
      
      validEmployees = employees.map(async (employee) => {
        const bambooUserData = await UserHelper.getUserOnBamboo(employee.id);
        if (bambooUserData.data) return bambooUserData.data;
      });
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error.message, 500, res);
    }
    const validEmployeesData = await Promise.all(validEmployees);
    const invalidEmployeesData = await Promise.all(invalidEmployees);
    logger(`invalidEmployees : ${validEmployeesData}`);
    logger(`validEmployees : ${invalidEmployeesData}`);
    if (invalidEmployeesData.length) {
      logger(`The following Ids where not found on BambooHr : ${invalidEmployeesData}`);
    }
    if (validEmployeesData.length) {
      req.bambooUsersData = validEmployeesData;
      next();
    }
  }

  static async validateRequest(req, res, next) {
    const { bambooUsersData } = req;
    let newUsers = [];
    let existingUsers = [];
    try {
      existingUsers = bambooUsersData.map(async (bambooUserData) => {
        const userExists = await UserQuery.getUser(bambooUserData.workEmail);
        if (userExists) return bambooUserData;
      });
      newUsers = bambooUsersData.map(async (bambooUserData) => {
        const userExists = await UserQuery.getUser(bambooUserData.workEmail);
        if (!userExists) return bambooUserData;
      });

      const newUsersData = await Promise.all(newUsers);
      const existingUsersData = await Promise.all(existingUsers);
      logger(`existingUsers : ${existingUsersData}`);
      logger(`newUsers : ${newUsersData}`);

      if (newUsersData.length) req.newUsersData = newUsersData;
      if (existingUsersData.length) req.existingUsersData = existingUsersData;
      next();
    } catch (error) {
      /* istanbul ignore next */
      Error.handleError(error.message, 500, res);
    }
  }
}

export default BambooWebhookValidator;
