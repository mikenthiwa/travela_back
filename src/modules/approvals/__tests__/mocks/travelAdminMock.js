const travelAdminMock = {
  payload: {
    UserInfo: {
      id: '-MUyHJmKrxA90lPNQ1FOLNm',
      fullName: 'Tomato Jos',
      email: 'tomato.jos@@andela.com',
      picture: 'fake.png'
    }
  },
  payload2: {
    UserInfo: {
      id: '-MUyHJmKrxA90lPNQ1F',
      fullName: 'Mac  doe',
      email: 'mac.doe@@andela.com',
      picture: 'fake.png'
    }
  },
  userMock: [
    {
      id: 20200,
      fullName: 'Tomato Jos',
      email: 'tomato.jos@@andela.com',
      userId: '-MUyHJmKrxA90lPNQ1FOLNm',
      location: 'Lagos',
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01'
    },
    {
      id: 9090,
      fullName: 'Mac  doe',
      email: 'mac.doe@@andela.com',
      userId: '-MUyHJmKrxA90lPNQ1F',
      location: 'Lagos',
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01'
    }
  ],
  role: [
    {
      id: 10948,
      roleName: 'Super Administrator',
      description: 'Can perform all task on travela',
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01'
    },
    {
      id: 29187,
      roleName: 'Travel Administrator',
      description: 'Can view and approve all request on  travela',
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01'
    },
    {
      id: 53019,
      roleName: 'Manager',
      description: 'Can request and approve travel request ',
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01'
    },
  ],
  center: [
    {
      id: 12345,
      location: 'Lagos, Nigeria'
    },
    {
      id: 23456,
      location: 'Nairobi, Kenya'
    }
  ],
  requestMock: [
    {
      id: '100',
      name: 'Tomato Jos',
      manager: 'Tomato Jos',
      tripType: 'return',
      gender: 'male',
      department: 'Fellows-Partner Service',
      picture: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png',
      role: 'Software Developer',
      status: 'Open',
      budgetStatus: 'Open',
      userId: '-MUyHJmKrxA90lPNQ1FOLNm'
    },
    {
      id: '200',
      name: 'girly',
      manager: 'Tomato Jos',
      tripType: 'return',
      gender: 'male',
      department: 'Fellows-Partner Service',
      picture: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png',
      role: 'Software Developer',
      status: 'Approved',
      budgetStatus: 'Approved',
      userId: '-MUyHJmKrxA90lPNQ1FOLNm'
    },
    {
      id: '300',
      name: 'Tomato Jos',
      manager: 'Tomato Jos',
      tripType: 'return',
      gender: 'male',
      department: 'Fellows-Partner Service',
      picture: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png',
      role: 'Software Developer',
      status: 'Verified',
      budgetStatus: 'Approved',
      userId: '-MUyHJmKrxA90lPNQ1FOLNm'
    }
  ],
  trips: [
    {
      id: 10,
      origin: 'Lagos, Nigeria',
      destination: 'Nairobi, Kenya',
      departureDate: '2019-04-25',
      returnDate: '2019-05-25',
      createdAt: '2019-04-24',
      updatedAt: '2019-05-24',
      accommodationType: 'Not Required',
      requestId: '100'
    },
    {
      id: 20,
      origin: 'Nairobi, Kenya',
      destination: 'Lagos, Nigeria',
      departureDate: '2019-04-25',
      returnDate: '2019-05-25',
      createdAt: '2019-04-24',
      updatedAt: '2019-05-24',
      accommodationType: 'Not Required',
      requestId: '200'
    },
    {
      id: 30,
      origin: 'Nairobi, Kenya',
      destination: 'Lagos, Nigeria',
      departureDate: '2019-04-25',
      returnDate: '2019-05-25',
      createdAt: '2019-04-24',
      updatedAt: '2019-05-24',
      accommodationType: 'Not Required',
      requestId: '300'
    },
  ],
  userRoles: [
    {
      id: 10,
      userId: 20200,
      roleId: 10948,
      centerId: 12345,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
    {
      id: 20,
      userId: 20200,
      roleId: 10948,
      centerId: 23456,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
    {
      id: 30,
      userId: 20200,
      roleId: 53019,
      centerId: 23456,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
    {
      id: 90,
      userId: 9090,
      roleId: 10948,
      createdAt: '2018-08-16 012:11:52.181+01',
      updatedAt: '2018-08-16 012:11:52.181+01',
    },
  ]
};
export default travelAdminMock;
