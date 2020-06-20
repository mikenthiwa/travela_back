const userMock = [
  {
    id: 20000,
    fullName: 'Andrew Hinga',
    email: 'captan.america@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNp',
    location: 'Kenya',
    createdAt: '2019-01-16 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01'
  },
  {
    id: 20001,
    fullName: 'Bolton Otieno',
    email: 'captan.egypt@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNm',
    location: 'Nigeria',
    createdAt: '2019-01-16 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01'
  }
];

const payload = {
  UserInfo: {
    id: '-MUnaemKrxA90lPNQs1FOLNp',
    fullName: 'Andrew Hinga',
    email: 'captan.america@andela.com',
    name: 'Andrew Hinga',
    location: 'Kenya'
  }
};

const userRole = [
  {
    userId: 20000,
    roleId: 10948
  },
  {
    userId: 20001,
    roleId: 401938
  }
];

const hotelEstimate = [
  {
    id: 100,
    countryId: 12345,
    regionId: null,
    estimate: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: 20000
  },
  {
    id: 99,
    countryId: 23456,
    regionId: null,
    estimate: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: 20000
  },
  {
    id: 98,
    countryId: null,
    regionId: 1002,
    estimate: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: 20000
  }
];

const travelRegions = [
  {
    id: 1002,
    region: 'West Africa',
    description: 'Nigeria',
    createdAt: '2019-10-05T09:37:11.170Z',
    updatedAt: '2019-10-05T09:37:11.170Z'
  },
  {
    id: 1,
    region: 'North Africa',
    description: 'Egypt,Eritrea,Sudan,Somalia,Ethiopia',
    createdAt: '2019-10-05T09:37:11.170Z',
    updatedAt: '2019-10-05T09:37:11.170Z'
  },
  {
    id: 2,
    region: 'South Africa',
    description: 'zimbambwe,Botswana',
    createdAt: '2019-10-05T09:37:11.170Z',
    updatedAt: '2019-10-05T09:37:11.170Z'
  },
  {
    id: 1001,
    region: 'East Africa',
    description: 'Kenya, Uganda and Rwanda',
    createdAt: '2019-10-05T08:36:11.170Z',
    updatedAt: '2019-10-05T08:36:11.170Z'
  },
  {
    id: 9999,
    region: 'Default Region',
    description: 'Fallback Region for countries that don\'t have regions yet',
    createdAt: '2019-10-05T09:37:11.170Z',
    updatedAt: '2019-10-05T09:37:11.170Z'
  },
];

const countries = [
  {
    id: 12345,
    country: 'Kenya',
    createdAt: new Date(),
    updatedAt: new Date(),
    regionId: 1001
  },
  {
    id: 23456,
    country: 'Uganda',
    createdAt: new Date(),
    updatedAt: new Date(),
    regionId: 1001
  },
  {
    id: 54675,
    country: 'Tanzania',
    createdAt: new Date(),
    updatedAt: new Date(),
    regionId: 1001
  }
];

export default {
  userMock,
  payload,
  userRole,
  countries,
  travelRegions,
  hotelEstimate
};
