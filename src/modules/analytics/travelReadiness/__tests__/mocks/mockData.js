
export const userRole = {
  id: 50,
  userId: 2015,
  roleId: 29187,
  createdAt: '2018-10-25',
  updatedAt: '2018-10-25'
};
export const superAdminRole = {
  id: 52,
  userId: 2015,
  roleId: 10948,
  createdAt: '2018-10-25',
  updatedAt: '2018-10-25'
};
export const travelAdmin = {
  id: 2015,
  fullName: 'Miguna Miguna',
  email: 'travel.admin@andela.com',
  userId: '-HyfghjTUGfghjkIJM',
  passportName: 'Travel Admin',
  location: 'Lagos',
};
export const travelRequester = {
  id: 2016,
  fullName: 'Odi Dance',
  email: 'odi.dance@andela.com',
  userId: '-AVwHJmKrxA90lPNQ1Fjkl',
  name: 'Odi',
  picture: '',
  gender: 'male',
  location: 'Lagos'
};
export const tripsData = bedId => (
  [
    {
      id: 'Y67hjkrui',
      origin: 'Kampala',
      destination: 'Lagos, Nigeria',
      departureDate: '2018-10-28',
      returnDate: '2018-11-30',
      checkStatus: 'Not Checked In',
      checkInDate: '2018-10-29',
      checkOutDate: '2018-11-30',
      lastNotifyDate: '2018-10-28',
      notificationCount: 0,
      requestId: 'ASer765ui9',
      bedId,
    },

    {
      id: 'Y6hjjUIui',
      origin: 'Addis',
      destination: 'Lagos, Nigeria',
      departureDate: '2018-10-29',
      returnDate: '2018-11-30',
      checkStatus: 'Not Checked In',
      checkInDate: '2018-10-29',
      checkOutDate: '2018-11-30',
      lastNotifyDate: '2018-10-28',
      notificationCount: 0,
      requestId: 'ASer45yui9',
      bedId,
    },
    {
      id: 'Y67hjkpui',
      origin: 'Bujumbura',
      destination: 'Lagos, Nigeria',
      departureDate: '2018-10-27',
      returnDate: '2018-11-30',
      checkStatus: 'Not Checked In',
      checkInDate: '2018-10-29',
      checkOutDate: '2018-11-30',
      lastNotifyDate: '2018-10-28',
      notificationCount: 0,
      requestId: 'ASer79yui9',
      bedId,
    },
    {
      id: 'Y67hjkoui',
      origin: 'Bujumbura',
      destination: 'Lagos, Nigeria',
      departureDate: '2018-10-27',
      returnDate: '2018-11-30',
      checkStatus: 'Not Checked In',
      checkInDate: '2018-10-29',
      checkOutDate: '2018-11-30',
      lastNotifyDate: '2018-10-28',
      notificationCount: 0,
      requestId: 'ASer78yui9',
      bedId,
    },
    {
      id: 'Y67hlnoui',
      origin: 'Lagos, Nigeria',
      destination: 'Santorini',
      departureDate: '2018-10-27',
      returnDate: '2018-11-30',
      checkStatus: 'Not Checked In',
      checkInDate: '2018-10-29',
      checkOutDate: '2018-11-30',
      lastNotifyDate: '2018-10-28',
      notificationCount: 0,
      requestId: 'BFor098uk0',
      bedId,
    },
  ]
);
export const requestsData = [
  {
    id: 'ASer78yui9',
    name: 'Op Operandi',
    tripType: 'return',
    status: 'Approved',
    manager: 'Samuel kUBAI',
    gender: 'female',
    role: 'Software Developer',
    picture: 'https://anything',
    userId: '-HyfghjTUGfghjkIJM',
    department: 'TDD'

  },
  {
    id: 'ASer79yui9',
    name: 'Op Operandi',
    tripType: 'return',
    status: 'Approved',
    manager: 'Samuel kUBAI',
    gender: 'female',
    role: 'Software Developer',
    picture: 'https://anything',
    userId: '-HyfghjTUGfghjkIJM',
    department: 'TDD'


  },
  {
    id: 'ASer45yui9',
    name: 'Kana Mare',
    tripType: 'return',
    status: 'Approved',
    manager: 'Samuel kUBAI',
    gender: 'female',
    role: 'Software Developer',
    picture: 'https://anything',
    userId: '-HyfghjTUGfghjkIJM',
    department: 'TDD'

  },
  {
    id: 'ASer765ui9',
    name: 'Kongo Love',
    tripType: 'return',
    status: 'Approved',
    manager: 'Samuel kUBAI',
    gender: 'female',
    role: 'Software Developer',
    picture: 'https://anything',
    userId: '-HyfghjTUGfghjkIJM',
    department: 'TDD'

  },
  {
    id: 'BFor098uk0',
    name: 'Big Man',
    tripType: 'return',
    status: 'Approved',
    manager: 'Samuel kUBAI',
    gender: 'male',
    role: 'Software Developer',
    picture: 'https://anything',
    userId: '-GyfhjjTUGfgfykMLJ',
    department: 'TDD'
  },
];
export const readinessResponse = [{
  departureDate: '2019-1-16',
  request: {
    name: 'Rumba Doe'
  },
  travelReadiness: '0% complete',
  arrivalDate: '2018-10-17T00:00:00.000Z'

},
{
  departureDate: '2014-10-16',
  request: {
    name: 'Chine Doe'
  },
  travelReadiness: '0% complete',
  arrivalDate: '2018-10-17T00:00:00.000Z'

},
{
  departureDate: '2015-10-16',
  request: {
    name: 'KongoDoe'
  },
  travelReadiness: '0% complete',
  arrivalDate: '2018-10-17T00:00:00.000Z'
}
];
export const postGuestHouse = {
  houseName: 'Mini flat',
  location: 'Lagos Nigeria',
  bathRooms: '1',
  imageUrl: 'https://www.lol.com',
  genderPolicy: 'Unisex',
  rooms: [
    {
      roomName: 'big cutter',
      roomType: 'ensuited',
      bedCount: '10'
    },
    {
      roomName: 'small cutter',
      roomType: 'non-ensuited',
      bedCount: '10'
    }
  ]
};
