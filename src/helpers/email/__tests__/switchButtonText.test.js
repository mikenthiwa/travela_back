import switchButtonText from '../switchButtonText';

describe('Switch Button helper', () => {
  it('should show View Request in case of new request', (done) => {
    expect(switchButtonText('New Request')).toEqual('View Request');
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
});
