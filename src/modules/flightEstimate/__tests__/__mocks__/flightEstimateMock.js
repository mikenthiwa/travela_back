const userMock = [
  {
    id: 20000,
    fullName: 'Kayode Okunlade',
    email: 'kayode.dev@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNp',
    location: 'Kenya',
    createdAt: '2019-01-16 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01'
  },
  {
    id: 20001,
    fullName: 'John Paul',
    email: 'john.dev@andela.com',
    userId: '-MUnaemKrxA90lPNQs1FOLNm',
    location: 'Nigeria',
    createdAt: '2019-01-16 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01'
  }
];

const payload = {
  UserInfo: {
    id: '-MUnaemKrxA90lPNQs1FOLNp',
    fullName: 'Kayode Okunlade',
    email: 'kayode.dev@andela.com',
    name: 'Kayode Okunlade',
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

const travelRegions = [
  {
    id: '1001',
    region: 'East Africa',
    description: 'Kenya, Uganda and Rwanda',
    createdAt: '2019-10-05T08:36:11.170Z',
    updatedAt: '2019-10-05T08:36:11.170Z',
  },
  {
    id: '1002',
    region: 'West Africa',
    description: 'Nigeria',
    createdAt: '2019-10-05T09:37:11.170Z',
    updatedAt: '2019-10-05T09:37:11.170Z',
  },
  {
    id: '9999',
    region: 'Default Region',
    description: 'Fallback Region for countries that don\'t have regions yet',
    createdAt: '2019-10-05T09:38:11.170Z',
    updatedAt: '2019-10-05T09:38:11.170Z',
  }
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

const flightEstimate = [{
  id: 32242,
  amount: 735,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: '-MUnaemKrxA90lPNQs1FOLNp',
  originRegionId: 1002,
  destinationCountryId: 23456,
},
{
  id: 32249,
  amount: 750,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: '-MUnaemKrxA90lPNQs1FOLNp',
  originRegionId: 1001,
  destinationRegionId: 1002,
}];

export default {
  userMock,
  payload,
  userRole,
  countries,
  travelRegions,
  flightEstimate
};
