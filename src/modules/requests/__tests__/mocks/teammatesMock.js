import moment from 'moment';

export const today = days => moment(new Date(), 'YYYY-MM-DD').add(days, 'days');

export const requestsMock = [
  {
    id: '-ss60B42oZ-a',
    name: 'Ademola Ariya',
    manager: 'Samuel Kubai',
    gender: 'Male',
    department: 'TDD',
    status: 'Verified',
    role: 'Software Developer',
    userId: '-LHJmKrxA8SlPNQFOVVm',
    picture: 'fakepicture.png',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
    tripType: 'oneWay'
  },
  {
    id: '-ss60B42oZ-b',
    name: 'Ademola Ariya',
    manager: 'Samuel Kubai',
    tripType: 'return',
    gender: 'Male',
    department: 'TDD',
    status: 'Verified',
    role: 'Software Developer',
    userId: '-LHJmKrxA8SlPNQFOVVewfds',
    picture: 'fakepicture.png',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
  {
    id: '-ss60B42oZ-c',
    name: 'Amara Agbo',
    tripType: 'multi',
    manager: 'Samuel Kubai',
    gender: 'Male',
    department: 'TDD',
    status: 'Verified',
    role: 'Software Developer',
    userId: '-LHJmKrxA8SlPsdvdsNQFOVVewfds',
    picture: 'fakepicture.png',
    createdAt: '2018-08-16 012:11:52.181+01',
    updatedAt: '2018-08-16 012:11:52.181+01',
  },
];

export const mockTrips = [
  {
    id: 3,
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    departureDate: today(1),
    returnDate: '2018-05-25',
    createdAt: '2018-05-20',
    updatedAt: '2018-05-20',
    bedId: 1,
    requestId: '-ss60B42oZ-b'
  },
  {
    id: 4,
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    departureDate: today(3),
    returnDate: '2018-05-25',
    createdAt: '2018-05-20',
    updatedAt: '2018-05-20',
    bedId: 1,
    requestId: '-ss60B42oZ-c'
  },
  {
    id: 6,
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    departureDate: today(2),
    returnDate: '2018-05-25',
    createdAt: '2018-05-20',
    updatedAt: '2018-05-20',
    bedId: 1,
    requestId: '-ss60B42oZ-c'
  },
  {
    id: 5,
    origin: 'Nairobi, Kenya',
    destination: 'Lagos, Nigeria',
    departureDate: today(1),
    returnDate: null,
    createdAt: '2018-05-20',
    updatedAt: '2018-05-20',
    bedId: 1,
    requestId: '-ss60B42oZ-a'
  }
];
