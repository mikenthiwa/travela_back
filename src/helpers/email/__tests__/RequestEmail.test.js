import RequestEmail, { BudgetCheckerEmail } from '../RequestEmail';
import RequestEmailMock, { mockRequestData } from './RequestEmailMock';
import NotificationEngine from '../../../modules/notifications/NotificationEngine';


NotificationEngine.dispatchEmail = jest.fn();

describe('Request Email Test', () => {
  it('should render the manager email', async () => {
    RequestEmailMock();
    const requestEmail = new RequestEmail('123');

    await requestEmail.send({
      fullName: 'Moses Gitau',
      email: 'some email'
    }, 'Manager Approval Email', {
      approvalLink: 'http://approval-link',
      rejectLink: 'http://reject-link',
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/my-approvals/123`
    });


    expect(NotificationEngine.dispatchEmail).toHaveBeenCalled();
  });

  it('should render the budget checker email', async () => {
    RequestEmailMock({
      ...mockRequestData,
      tripType: 'return'
    });
    const requestEmail = new BudgetCheckerEmail('123');

    await requestEmail.send({
      fullName: 'Moses Gitau',
      email: 'some email'
    }, 'Budget Approval Email', {
      approvalLink: 'http://approval-link',
      rejectLink: 'http://reject-link',
      redirectLink: `${process.env.REDIRECT_URL}/redirect/requests/budget/123`
    });


    expect(NotificationEngine.dispatchEmail).toHaveBeenCalled();
  });
});
