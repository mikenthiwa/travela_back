const user = {
  id: 2610,
  fullName: 'Troy Abed',
  email: 'troy.abed@andela.com',
  userId: '-MDhi374992jfGeSF',
  picture: 'Picture',
  location: 'Lagos',
  createdAt: '2019-02-13 009:11:52.181+01',
  updatedAt: '2019-02-13 009:11:52.181+01'
};

const user2 = {
  id: 2612,
  fullName: 'Ayn Rand',
  email: 'ayn.rand@andela.com',
  userId: '-MHh54i374j5fdFDfGSF',
  picture: 'Picture',
  location: 'Lagos',
  createdAt: '2019-02-13 009:11:52.181+01',
  updatedAt: '2019-02-13 009:11:52.181+01'
};

const payload2 = {
  UserInfo: {
    id: '-MHh54i374j5fdFDfGSF',
    name: 'Ayn Rand',
    email: 'ayn.rand@andela.com',
  }
};

const payload = {
  UserInfo: {
    id: '-MDhi374992jfGeSF',
    name: 'Troy Abed',
    email: 'troy.abed@andela.com',
  }
};

const validTravelReason = {
  title: 'Boot camp',
  description: 'Travelling to one of Andela\'s centers to participate in the boot camp process.'
};

const validTravelReason2 = {
  title: 'Boot camp',
  description: 'Travelling to one of Andela\'s centers to participate in the boot camp process. more more duplication'
};

const invalidTravelReasonTitle = {
  title: 'Don\'t do drugs kids, go to school',
  description: 'Travelling to one of Andela\'s centers to participate in the boot camp process.'
};

const invalidTravelReasonId = {
  title: 'Boot camp',
  description: 'Travelling to one of Andela\'s centers to participate in the boot camp process.'
};

const invalidTravelReasonDescription = {
  title: 'Boot camp',
  description: 'Travelling to one of Andela\'s centers to participate in the boot camp process. Add more bla bla so that it can exceed 140 characters and it can fail validation. hope this is enough.'
};


const SuperAdminRole = {
  id: 9000,
  userId: 2610,
  roleId: 10948,
  centerId: 12345,
  createdAt: '2019-01-04 012:11:52.181+01',
  updatedAt: '2019-01-16 012:11:52.181+01',
};

const centers = {
  id: 12345,
  location: 'Lagos, Nigeria',
  createdAt: '2019-02-12',
  updatedAt: '2019-02-12'
};

export default {
  user,
  user2,
  payload2,
  payload,
  SuperAdminRole,
  validTravelReason,
  validTravelReason2,
  invalidTravelReasonDescription,
  invalidTravelReasonId,
  invalidTravelReasonTitle,
  centers
};
