const user = [
  {
    id: 1,
    fullName: 'Samuel Kubai',
    email: 'sam.kubai@andela.com',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    picture: 'Picture',
    location: 'Lagos',
    createdAt: '2019-02-11 012:11:52.181+01',
    updatedAt: '2019-02-11 012:11:52.181+01'
  },
  {
    id: 2,
    fullName: 'Esther Mukungu',
    email: 'esther.muk@andela.com',
    userId: '-LMgZQKq6MXAj_41iRWi',
    picture: 'Picture',
    location: 'Lagos',
    createdAt: '2019-02-11 012:11:52.181+01',
    updatedAt: '2019-02-11 012:11:52.181+01'
  }
];

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    userId: '-MUyHJmKrxA90lPNQ1FOLNm',
    email: 'sam.kubai@andela.com',
    name: 'Samuel Kubai'
  }
};

const payloadNotAdmin = {
  UserInfo: {
    userId: '-LMgZQKq6MXAj_41iRWi',
    email: 'esther.muk@andela.com',
    name: 'Esther Mukungu'
  }
};
const userRole = [{
  id: 1,
  userId: 1,
  roleId: 10948,
  centerId: 12345,
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  id: 2,
  userId: 2,
  roleId: 401938,
  centerId: 12345,
  createdAt: new Date(),
  updatedAt: new Date()
}
];

const travelStipend = {
  stipend: 300,
  center: 'Kenya'
};

const updatedTravelStipend = {
  stipend: 300,
};

const listOfStipends = [
  {
    id: 1,
    amount: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '-MUyHJmKrxA90lPNQ1FOLNm',
    country: 'Default'
  },
  {
    id: 100,
    amount: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '-MUyHJmKrxA90lPNQ1FOLNm',
    country: 'Kenya'
  },
  {
    id: 200,
    amount: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '-MUyHJmKrxA90lPNQ1FOLNm',
    country: 'Nigeria'
  }
];
const centers = [
  {
    id: 12345,
    location: 'Lagos',
    createdAt: new Date(),
    updatedAt: new Date()

  },
  {
    id: 23456,
    location: 'Kampala',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 54675,
    location: 'Nairobi',
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

const regions = [
  {
    id: '9999',
    region: 'Default Region',
    description: 'Fallback Region for countries that don\'t have regions yet',
    createdAt: '2019-10-05T09:38:11.170Z',
    updatedAt: '2019-10-05T09:38:11.170Z',
  }
];

export default {
  user,
  payload,
  userRole,
  centers,
  listOfStipends,
  payloadNotAdmin,
  travelStipend,
  updatedTravelStipend,
  regions
};
