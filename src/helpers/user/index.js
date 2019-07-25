import jwtDecode from 'jwt-decode';
import jwt from 'jsonwebtoken';
import models from '../../database/models';

const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const { Op } = models.Sequelize;

class UserHelper {
  static authorizeRequests(token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  static getUserOnBamboo(bambooHRId) {
    const bambooAPIRoute = process.env.BAMBOOHR_API.replace('{bambooHRId}', bambooHRId);
    return axios.get(bambooAPIRoute, {
      headers: {
        Accept: 'application/json'
      }
    });
  }

  static getUserLocation(country) {
    const countries = {
      Nigeria: 'Lagos',
      Kenya: 'Nairobi',
      Uganda: 'Kampala',
      Rwanda: 'Kigali',
      USA: 'New York'
    };
    return countries[country] ? countries[country] : country;
  }

  static getCenterId(location) {
    const centerIds = {
      Lagos: 12345,
      Nigeria: 12345,
      Nairobi: 23456,
      Kenya: 23456,
      Kampala: 34567,
      Uganda: 34567,
      Kigali: 56789,
      Rwanda: 56789,
      'New York': 45678,
      USA: 45678,
    };
    return centerIds[location] || 0;
  }

  static async getDestinationTravelAdmin(centerIds) {
    const users = centerIds.map(async (centerId) => {
      const travelAdmin = await models.UserRole.findAll({ where: { roleId: { [Op.in]: [29187, 339458] }, centerId }, include: [{ model: models.User, as: 'user' }] });
      if (travelAdmin.length) {
        return travelAdmin.map(user => user.dataValues.user);
      }
    });
    const [travelAdmins] = await Promise.all(users);
    return travelAdmins;
  }

  static decodeToken(token) {
    const userData = jwtDecode(token);
    return userData;
  }

  static async setToken(userInfo) {
    const UserInfo = await {
      id: userInfo.dataValues.userId,
      fullName: userInfo.dataValues.fullName,
      name: userInfo.dataValues.fullName,
      email: userInfo.dataValues.email,
      picture: userInfo.dataValues.picture,
      roles: userInfo.dataValues.occupation,
      location: userInfo.dataValues.location,
    };
    const token = jwt.sign({ UserInfo }, process.env.JWT_PUBLIC_KEY, { expiresIn: '30d' });
    return token;
  }
}
module.exports = UserHelper;
