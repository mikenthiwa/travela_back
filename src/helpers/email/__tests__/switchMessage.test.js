import switchMessage from '../switchMessage';

describe('switchMessage helper', () => {
  it('should return new Request message', (done) => {
    const receivedMessage = switchMessage(
      { type: 'New Request', senderName: 'Tester' }
    );

    expect(receivedMessage.split(' ')).toContain('Travela');
    done();
  });

  it('should return approved message', (done) => {
    const receivedMessage = switchMessage(
      {
        type: 'Approved', senderName: 'An_Jin', requestId: '36Ydgha42e', details: { checker: 'checker Sammy Njau' }
      }
    );

    expect(receivedMessage.split(' ')).toContain('travel');
    expect(receivedMessage.split(' ')[2]).toEqual('request');
    done();
  });

  it('should return reject message', (done) => {
    const receivedMessage = switchMessage(
      { type: 'Rejected', senderName: 'Mixon_yong', requestId: '36Ydgha42e' }
    );

    expect(receivedMessage.split(' ')).toContain('Mixon_yong.');
    expect(receivedMessage.split(' ')[3]).toEqual('<b>#36Ydgha42e</b>');
    done();
  });

  it('should return verified message', (done) => {
    const receivedMessage = switchMessage(
      { type: 'Verified', senderName: 'Luke Skywalker', requestId: '36Ydgha42e' }
    );

    expect(receivedMessage.split(' ')).toContain('Luke');
    expect(receivedMessage.split(' ')[3]).toEqual('<b>#36Ydgha42e</b>');
    done();
  });

  it('should return posted comment message', (done) => {
    const receivedMessage = switchMessage(
      { type: 'Request', senderName: 'Tester', comment: { dataValues: { picture: 'fake' } } }
    );
    expect(receivedMessage.split(' ')).toContain('Login');
    done();
  });

  it('should return posted comment message on a documemt', (done) => {
    const receivedMessage = switchMessage(
      { type: 'Document', senderName: 'Tester', comment: { dataValues: { picture: 'fake' } } }
    );
    expect(receivedMessage.split(' ')).toContain('Login');
    done();
  });

  it('should return reminder email template message', (done) => {
    const receivedMessage = switchMessage(
      { type: 'Reminder', senderName: 'Tester', details: 'message details' }
    );
    expect(receivedMessage.split(' ')).toContain('details.');
    done();
  });

  it('should return nothing for non-available type', (done) => {
    const receivedMessage = switchMessage(
      { type: 'notification', senderName: 'Tester' }
    );
    expect(receivedMessage).toEqual('');
    done();
  });

  it('should return update Request message', (done) => {
    const receivedMessage = switchMessage(
      { type: 'Updated Request', senderName: 'Malibua' }
    );

    expect(receivedMessage.split(' ')).toContain('Login');
    done();
  });

  it('should return delete Request message', (done) => {
    const receivedMessage = switchMessage(
      { type: 'Deleted Request', senderName: 'Malibua' }
    );

    expect(receivedMessage.split(' ')).toContain('Login');
    done();
  });

  it('should return empty string with invalid type', (done) => {
    const receivedMessage = switchMessage(
      { type: 'deleted Request', senderName: 'Malibua' }
    );

    expect(receivedMessage.split(' ')).toContain('');
    done();
  });

  it('should return changed room message', (done) => {
    const receivedMessage = switchMessage({
      type: 'Changed Room', senderName: 'Tester', requestId: '36Ydgha42e'
    });
    expect(receivedMessage.split(' ')).toContain('updated', 'Login');
    done();
  });
  it('should return fill survey message', (done) => {
    const surveyMessage = switchMessage({
      type: 'Trip Survey', senderName: 'Tester'
    });
    expect(surveyMessage.split(' ')).toContain('fill', 'survey');
    done();
  });
  it('should return travel readiness', (done) => {
    const readinessMessage = switchMessage({
      type: 'Travel Readiness', senderName: 'Travela'
    });
    expect(readinessMessage.split(' ')).toContain('achieved', 'readiness');
    done();
  });
  it('should return edit document message', (done) => {
    const editNoticeMessage = switchMessage({
      type: 'Edit Travel Document', details: { user: { name: 'Tester' } }
    });
    expect(editNoticeMessage.split(' ')).toContain('edited', 'document');
    done();
  });
  it('should return document verification message for passport', (done) => {
    const verifiedMessage = switchMessage({
      type: 'Travel Readiness Document Verified', details: { type: 'passport', data: 'DFGHT' }
    });
    expect(verifiedMessage.split(' ')).toContain('verified');
    done();
  });
  it('should return document verification message for other documents', (done) => {
    const verifiedMessage = switchMessage({
      type: 'Travel Readiness Document Verified',
      details: { type: 'other', data: { name: 'yellow fever' } }
    });
    expect(verifiedMessage.split(' ')).toContain('verified');
    done();
  });
  it(`should return appropriate message to notify travel admins when
    managers approve a request`, (done) => {
    const verifiedMessage = switchMessage({
      type: 'Notify Travel Admins of Manager Approval',
      details: { requesterName: 'Tester' }
    });
    expect(verifiedMessage.split(' ')).toContain('<b>Tester</b>\'s', 'manager', 'approved');
    done();
  });
  it(`should return appropriate message to notify travel admins of
    100% checklist completion`, (done) => {
    const verifiedMessage = switchMessage({
      type: 'Notify Travel Admins Checklist Completion',
      senderName: 'AnotherTester',
      details: {
        requestId: 'We342'
      }
    });
    expect(verifiedMessage.split(' ')).toContain('<b>AnotherTester</b>', 'completed', 'We342');
    done();
  });

  it(`should return appropriate message when
   you are mentioned in a comment`, (done) => {
    const verifiedMessage = switchMessage({
      type: 'You were mentioned in a comment',
      senderName: 'AnotherTester',
      details: {
        requestId: 'We342',
        requesterName: 'Ebube Egbuna'
      }
    });
    expect(verifiedMessage.split(' ')).toContain('Ebube', 'Egbuna', 'mentioned');
    done();
  });

  it('should return budget approval message for the approved budget', (done) => {
    const budgetApprovalMsg = switchMessage({
      type: 'Budget Approval'
    });
    expect(budgetApprovalMsg.split(' ')[0]).toContain('Congratulations');
    done();
  });

  it('should return budget rejected message for the rejected budget', (done) => {
    const budgetRejectedMsg = switchMessage({
      type: 'Budget Rejected'
    });
    expect(budgetRejectedMsg.split(' ')[0]).toContain('Your');
    done();
  });
  it('should return email deletion message on requet deletion', (done) => {
    const budgetRejectedMsg = switchMessage({
      type: 'Notify Origin Tavel Team On Request Deletion',
      details: {
        requesterName: 'Sammy njau',
        requestId: 'trerefsv',
        location: 'Nakuru',
        tripType: 'return'
      }
    });
    expect(budgetRejectedMsg).toContain('This');
    done();
  });

  it('should return email deletion message on requet deletion', (done) => {
    const emailMsg = switchMessage({
      type: 'Notify Destination Tavel Team On Request Deletion',
      details: {
        requesterName: 'Sammy njau',
        requestId: 'trerefsv',
        location: 'Nakuru',
        tripType: 'return'
      }
    });
    expect(emailMsg).toContain('This');
    done();
  });
  it('should return email verification message', (done) => {
    const emailMsg = switchMessage({
      type: 'Travel Request Verified',
      details: {
        requesterName: 'Sammy njau',
        id: '12'
      }
    });
    expect(emailMsg.split(' ')[0]).toContain('This');
    done();
  });

  it('should return email  message to finance team', (done) => {
    const emailMsg = switchMessage({
      type: 'Notify finance team members',
      details: {
        requesterName: 'Sammy njau'
      }
    });
    expect(emailMsg).toContain('has');
    done();
  });
});
