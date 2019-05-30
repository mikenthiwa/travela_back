const date = new Date();
const dateToday = new Date(date.setDate(date.getDate()))
  .toISOString().split('T')[0];
const dateDeparture = new Date(date.setDate(date.getDate() + 1))
  .toISOString().split('T')[0];
const dateReturn = new Date(date.setDate(date.getDate() + 3))
  .toISOString().split('T')[0];

export const dates = {
  departureDate: dateDeparture,
  returnDate: dateReturn,
  dateToday
};

export const tripsData = [

  {
    id: 2,
    requestId: 1,
    origin: 'New York',
    destination: 'Nairobi',
    bedId: 12,
    departureDate: dates.dateToday,
    returnDate: dates.returnDate,
    checkOutDate: null,
    deletedAt: null,
    updatedAt: '2018-09-26T15:47:47.582Z',
    createdAt: '2018-09-26T15:47:47.582Z'
  },
];

export const mockRequest = {
  id: 1,
  userId: '-dhsunwujnsnjjUbhwKNG2',
  name: 'Mutungo Heights',
  manager: 'Mutungo John',
  tripType: 'return',
  gender: 'Male',
  department: 'TDD',
  picture: 'picture.png',
  role: 'Software Developer',
  deletedAt: null,
  updatedAt: '2018-09-26T15:47:47.582Z',
  createdAt: '2018-09-26T15:47:47.582Z'
};

export const GuestHouseData = {
  id: 'Rh46thdW',
  houseName: 'Mutungo Heights',
  location: 'Kampala, Uganda',
  bathRooms: '2',
  imageUrl: 'https://www.lol.com',
  genderPolicy: 'Unisex',
  userId: '-dhsunwujnsnjjUbhwKNG2',
  createdAt: '2018-09-26T15:47:47.576Z',
  updatedAt: '2018-09-26T15:47:47.576Z',
};

export const GuestHouseRoomData = [{
  id: 'sE3u6thdW',
  roomName: 'Rwenzori',
  roomType: 'ensuited',
  bedCount: '2',
  faulty: false,
  guestHouseId: 'Rh46thdW',
  createdAt: '2018-09-26T15:47:47.576Z',
  updatedAt: '2018-09-26T15:47:47.576Z',
}, {
  id: 'sE3u6thdW2',
  roomName: 'Rwenzori2',
  roomType: 'ensuited',
  bedCount: '1',
  faulty: false,
  guestHouseId: 'Rh46thdW',
  createdAt: '2018-09-26T15:47:47.576Z',
  updatedAt: '2018-09-26T15:47:47.576Z',
}];

export const GuestHouseBedData = [
  {
    id: 10,
    roomId: 'sE3u6thdW',
    bedName: 'bed 3',
    booked: true,
    updatedAt: '2018-09-26T15:47:47.582Z',
    createdAt: '2018-09-26T15:47:47.582Z'
  },
  {
    id: 11,
    roomId: 'sE3u6thdW',
    bedName: 'bed 4',
    booked: true,
    updatedAt: '2018-09-26T15:47:47.582Z',
    createdAt: '2018-09-26T15:47:47.582Z'
  }, {
    id: 12,
    roomId: 'sE3u6thdW2',
    bedName: 'bed 5',
    booked: true,
    updatedAt: '2018-09-26T15:47:47.582Z',
    createdAt: '2018-09-26T15:47:47.582Z'
  }
];

export const userRequestData = {
  id: 'Rh46thdW',
  houseName: 'Bukoto Heights',
  location: 'Kampala, Uganda',
  bathRooms: '5',
  imageUrl: 'https://www.lol.com',
  genderPolicy: 'Unisex',
  rooms: [
    {
      id: 'sE3u6thdW',
      roomName: 'big cutter',
      roomType: 'ensuited',
      bedCount: '2'
    },
  ]
};
