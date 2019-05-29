import Utils from '../../../../helpers/Utils';

const user = overrides => ({
  fullName: 'Moses Gitau',
  email: 'moses.gitau@andela.com',
  userId: 'moses-gitau',
  passportName: 'Moses Gitau',
  picture: 'picture.png',
  department: 'Operations',
  occupation: 'Operations Coordinator',
  gender: 'Male',
  location: 'Lagos, Nigeria',
  roleId: 401938,
  createdAt: '2019-03-25 18:19:46.763+03',
  updatedAt: '2019-03-25 18:19:46.763+03',
  bambooHrId: 0,
  manager: 'Moses Gitau',
  ...overrides
});

const request = (requester = user(), overrides) => ({
  id: '000001',
  name: requester.fullName,
  gender: requester.gender,
  department: requester.department,
  role: requester.occupation,
  status: 'Open',
  userId: requester.userId,
  tripType: 'return',
  createdAt: '2019-03-25 18:19:46.763+03',
  updatedAt: '2019-03-25 18:19:46.763+03',
  picture: 'picture.png',
  stipend: 0,
  stipendBreakdown: '',
  budgetStatus: 'Open',
  manager: requester.manager,
  tripModificationId: null,
  ...overrides
});

const trip = ({ id }, overrides) => ({
  id: '00002',
  requestId: id,
  origin: 'Nairobi, Kenya',
  destination: 'Kigali, Rwanda',
  departureDate: '2019-01-08',
  returnDate: '2019-01-09',
  createdAt: '2019-03-25 18:19:46.763+03',
  updatedAt: '2019-03-25 18:19:46.763+03',
  bedId: null,
  checkStatus: 'Not Checked In',
  accommodationType: 'Hotel Booking',
  ...overrides
});

const users = [
  user({
    id: 178912
  }),
  user({
    id: 801089,
    fullName: 'Moffat Gitau',
    email: 'moffat.gitau@andela.com',
    userId: 'moffat-gitau',
    passportName: 'Moffat Gitau',
    roleId: 29187,
  })
];

const requests = [
  request(users[0]),
  request(users[1], {
    id: '00003'
  }),
  ...Array(20).fill(0).map(
    (a, index) => request(users[0], {
      id: `9873${index}`,
      status: 'Approved'
    })
  )
];

const trips = requests.map((req, index) => (
  trip(req, {
    id: `791324${index}`
  })
));

const tokens = users.map(_user => (
  Utils.generateTestToken({
    UserInfo: {
      id: _user.userId,
      fullName: _user.userId,
      name: _user.fullName,
      email: _user.email,
      picture: _user.picture
    }
  })
));

const userRoles = users.map(_user => (
  {
    userId: _user.id,
    roleId: _user.roleId
  }
));

export default {
  users,
  requests,
  trips,
  userRoles,
  tokens
};
