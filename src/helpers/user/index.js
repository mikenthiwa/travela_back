import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

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

  static getUserOnProduction(res) {
    const workEmail = res.dataValues ? res.dataValues.email : res.data.workEmail;
    return axios.get(`${process.env.ANDELA_PROD_API}/users?email=${workEmail}`);
  }

  static getManagerOnProduction(id) {
    return axios.get(`${process.env.ANDELA_PROD_API}/users?bamboo_hr_id=${id}`);
  }


  static generateTravelaUser(productionUser, bambooUser) {
    const locations = productionUser.data.values[0].location != null
      ? productionUser.data.values[0].location.name
      : UserHelper.getUserLocation(bambooUser.data.location);
    const travelaUser = {
      fullName: productionUser.data.values[0].name,
      email: productionUser.data.values[0].email,
      userId: productionUser.data.values[0].id,
      passportName: productionUser.data.values[0].name,
      department: bambooUser.data.department,
      occupation: bambooUser.data.jobTitle,
      location: locations,
      picture: productionUser.data.values[0].picture,
      manager: bambooUser.data.supervisor,
      gender: bambooUser.data.gender,
    };
    return travelaUser;
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
}
export default UserHelper;
