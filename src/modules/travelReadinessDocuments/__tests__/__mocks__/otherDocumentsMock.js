const user = {
  id: '1000',
  fullName: 'Black Window',
  email: 'black.windows@andela.com',
  userId: '-MUyHJmKrxA90lPNQ1FOLNm',
  picture: 'Picture',
  location: 'Lagos',
  createdAt: '2018-08-16 012:11:52.181+01',
  updatedAt: '2018-08-16 012:11:52.181+01'
};

const payload = {
  UserInfo: {
    id: '-MUyHJmKrxA90lPNQ1FOLNm',
    name: 'Black Window'
  }
};

const validDocument = {
  other:
    {
      name: 'other',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    }
};

const invalidDocument = {
  invalidExpiryDate: {
    other: {
      name: 'Permit',
      dateOfIssue: '02-01-2018',
      expiryDate: '01-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    }
  },
  invalidName: {
    other: {
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    }
  },
  invalidWithVisaKeyword: {
    other: {
      name: 'Lagos_Visa',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    }
  },
  invalidWithPassportKeyword: {
    other: {
      name: 'Lagos_passport_01',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    }
  }
};


export default {
  user, payload, validDocument, invalidDocument,
};
