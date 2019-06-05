import switchButtonText from '../switchButtonText';

describe('Switch Button helper', () => {
  it('should show View Request in case of new request', (done) => {
    expect(switchButtonText('New Request')).toEqual('View Request');
    done();
  });
  it('should show Login to Travela in case of new requester request', (done) => {
    expect(switchButtonText('New Requester Request')).toEqual('Login to Travela');
    done();
  });
  it('should show View Document in case of new comment on a doucment', (done) => {
    expect(switchButtonText('Document')).toEqual('View Document');
    done();
  });
  it('should return nothing if type is not available', (done) => {
    expect(switchButtonText('')).toEqual('View Request');
    done();
  });
  it('should show Fill Survey in case of Trip Survey', (done) => {
    expect(switchButtonText('Trip Survey')).toEqual('Start Survey');
    done();
  });
  it('should show View Dashboard in case of Travel Readiness', (done) => {
    expect(switchButtonText('Travel Readiness')).toEqual('View Dashboard');
    done();
  });
  it('should show View Notification in case of Deleted Request', (done) => {
    expect(switchButtonText('Deleted Request')).toEqual('View Notification');
    done();
  });
  it('should show View document in case of Document Edit', (done) => {
    expect(switchButtonText('Edit Travel Document')).toEqual('View Document');
    done();
  });
  it('should show View Check Out Details in case of Guesthouse Check-out', (done) => {
    expect(switchButtonText('Guesthouse Check-out')).toEqual('View Check Out Details');
    done();
  });
  it('should show View Check In Details in case of Guesthouse Check-In', (done) => {
    expect(switchButtonText('Guesthouse Check-In')).toEqual('View Check In Details');
    done();
  });
  it('should show View Document in case of Travel Readiness Document Verified', (done) => {
    expect(switchButtonText('Travel Readiness Document Verified')).toEqual('View Document');
    done();
  });
  it('should show View Notification in case of Request deletion', (done) => {
    expect(switchButtonText('Notify Origin Tavel Team On Request Deletion')).toEqual('View Notification');
    done();
  });
  it('should show View Notification in case of Request deletion', (done) => {
    expect(switchButtonText('Notify Destination Tavel Team On Request Deletion')).toEqual('View Notification');
    done();
  });
  it('should show View Comment button in case of tagged user', (done) => {
    expect(switchButtonText('You were mentioned in a comment')).toEqual('View Comment');
    done();
  });
  it('should show Modify Request button in case of modify trips local admin', (done) => {
    expect(switchButtonText('Notify Travel Administrator of Trip Modification Origin')).toEqual('Modify Trip');
    done();
  });
  it('should show View Request button in case of modify trips destination admin', (done) => {
    expect(switchButtonText('Notify Travel Administrator of Trip Modification Destination'))
      .toEqual('View Request');
    done();
  });
  it('should show Login in case of Role assignment notification', (done) => {
    expect(switchButtonText('Send role assignment email notification')).toEqual('Login');
    done();
  });
  it('should show View Request Status in case of Approval', (done) => {
    expect(switchButtonText('Approved')).toEqual('View request status');
    done();
  });
  it('should show Fill Checklist in case of Budget Approval', (done) => {
    expect(switchButtonText('Budget Approval')).toEqual('Fill Checklist');
    done();
  });
  it('should show Verify in case of Notify Travel Admins Checklist Completion', (done) => {
    expect(switchButtonText('Notify Travel Admins Checklist Completion')).toEqual('Verify');
    done();
  });
});
