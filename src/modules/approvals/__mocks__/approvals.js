const ApprovalsController = {
  getUserApprovals: jest.fn((req, res, next) => { // eslint-disable-line
    return res.send({});
  }),
  updateRequestStatus: jest.fn((req, res, next) => { // eslint-disable-line
    return res.send({});
  }),
  approvals: jest.fn() // eslint-disable-line
};

export default ApprovalsController;
