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
  manager: 178912,
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

const approval = (requester = user(), overrides) => ({
  id: '000101010',
  requestId: '0001111',
  status: 'Approved',
  createdAt: '2019-03-25 18:19:46.763+03',
  updatedAt: '2019-03-25 18:19:46.763+03',
  deletedAt: null,
  budgetStatus: 'Open',
  budgetApprover: null,
  budgetApprovedAt: null,
  approverId: requester.id,
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
  }),
  user({
    id: 81110999,
    fullName: 'Adeyemi Adeyokunnu',
    email: 'adeyemi.adeyokunnu@andela.com',
    userId: 'adeyemi-adeyokunnu',
    passportName: 'Adeyemi Adeyokunnu',
    location: 'Kenya',
  }),
  user({
    id: 8111089,
    fullName: 'Adeniyi Adeyokunnu',
    email: 'adeniyi.adeyokunnu@andela.com',
    userId: 'adeniyi-adeyokunnu',
    passportName: 'Adeniyi Adeyokunnu',
    location: 'Kenya',
    roleId: 29187,
    centerId: 23456
  }),
  user({
    id: 9791089,
    fullName: 'Funmbi Adeniyi',
    email: 'funmbi.adeniyi@andela.com',
    userId: 'funmbi-Adeniyi',
    passportName: 'Funmbi Adeniyi',
    location: 'Rwanda',
    roleId: 29187,
    centerId: 34567
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
  ),
  ...Array(4).fill(0).map(
    (a, index) => request(users[2], {
      id: `000111${index}`,
      status: 'Approved'
    })
  )
];

const approvalsList = [
  approval(users[0]),
  approval(users[0], { id: '000004342', requestId: '0001112' })
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
    roleId: _user.roleId,
    centerId: _user.centerId,
  }
));

const centers = [
  {
    id: 12345,
    location: 'Nigeria',
    createdAt: '2019-02-12',
    updatedAt: '2019-02-12'
  },
  {
    id: 23456,
    location: 'Kenya',
    createdAt: '2019-02-12',
    updatedAt: '2019-02-12'
  },
  {
    id: 34567,
    location: 'Rwanda',
    createdAt: '2019-02-12',
    updatedAt: '2019-02-12'
  }
];

export default {
  users,
  requests,
  trips,
  userRoles,
  tokens,
  approvalsList,
  centers
};
