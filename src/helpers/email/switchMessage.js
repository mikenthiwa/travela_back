import checkoutTemplate from './checkoutTemplate';

export const travelReadinessVerification = (msgDetail) => {
  const messageInfo = 'Login to your travela account for details.';
  const message = `has been verified by ${msgDetail.senderName} on
    ${msgDetail.details.createdAt}. ${messageInfo}`;
  const docType = `Your ${msgDetail.details.type}`;
  if (msgDetail.details.type !== 'other') {
    if (msgDetail.details.type === 'passport') {
      return `${docType} with number ${msgDetail.details.data.passportNumber}
      ${message}`;
    }
    return `${docType} to ${msgDetail.details.data.country} ${message}`;
  } return `${docType} document, ${msgDetail.details.data.name} ${message}`;
};

const attachCommentToMail = msgDetail => (
  `
  <b>${msgDetail.senderName}</b> posted a comment.
        Login to your travela account for details.
  <table
          style ='width: 80%;
                  background-color: #F8F8F8;
                  margin: auto;
                  margin-bottom: 10px;
                  text-align: left;
                  '>
          <tbody >
            <tr >
            <td width='20%' ><img src=${msgDetail.picture}
            style='border-radius: 50%; width: 50px; height: 50px;'
            /></td>
            <td width='80%'>
              <i>${msgDetail.comment.dataValues.comment}</i></td>
            </tr>
            </tbody>
            </table>
  `
);

const attachRequesterToMail = msgDetail => (
  `Your travel request <b>${msgDetail.requestId}</b> has been sent to your
  manager
    <b>${msgDetail.senderName}</b> for approval. Please follow up with
    your manager.
    <br><br>
    <span style='color: #4f4f4f'>
    While you wait for your manager's approval, you can login to Travela
    and view
    the checklist you will be required to fulfil as you plan your trip.</span>
    <br><br>
    <span style='color: #4f4f4f '>Thank you.</span>.`);

const deleteMessage = msgDetail => `The travel request\
<b> #${msgDetail.requestId}</b> was just deleted
  by ${msgDetail.senderName}. Login to your travela account for details.`;

const updateMessage = msgDetail => `<b style='text-transform: capitalize;\
  '>${
  msgDetail.senderName
}</b> just updated a travel request for your approval. Login to your
  travela account for details.`;

const checKoutMessage = msgDetail => `<b style='text-transform: capitalize'>${
  msgDetail.senderName
}</b> has checked out at ${msgDetail.guesthouseName} guesthouse at ${
  msgDetail.checkoutTime
}`;

const switchMessage = (msgDetail) => {
  switch (msgDetail.type) {
    case 'Reminder':
      return `<b style='text-transform: capitalize'></b> ${msgDetail.details}.`;
    case 'New Request':
      return `Your direct report <b style='text-transform: capitalize'>${
        msgDetail.senderName
      }</b> has
        just submitted a travel request. Please login to Travela to take an
        approval decision.`;
    case 'Approved':
      return `Congratulations, your travel request has just been approved
      by your manager on Travela.
        Kindly fill out your travel checklist items by clicking on the button
        below.`;
    case 'Rejected':
      return (`Your travel request <b>#${msgDetail.requestId}</b> was rejected
      by
        ${msgDetail.senderName}. Login to your travela account for details.`);
    case 'Verified':
      return (`Your travel request <b>#${msgDetail.requestId}</b> was just
      verified by
          ${msgDetail.senderName}. Login to your travela account for details.`);
    case 'Request': return (attachCommentToMail(msgDetail));
    case 'Document': return (attachCommentToMail(msgDetail));
    case 'Deleted Request': return deleteMessage(msgDetail);
    case 'Updated Request': return updateMessage(msgDetail);
    case 'New Requester Request': return (attachRequesterToMail(msgDetail));
    case 'Changed Room':
      return `Your residence record for the travel request
        <a href='${process.env.REDIRECT_URL}/requests/${
  msgDetail.requestId
}'><b>#
        ${msgDetail.requestId}</b></a> was updated by ${
  msgDetail.senderName
}. <b>
        Login to your travela account for details.`;
    case 'Trip Survey':
      return checkoutTemplate(msgDetail.destination);
    case 'Travel Readiness':
      return (`${msgDetail.senderName[1]} has achieved 100% travel readiness
      for trip to ${msgDetail.senderName[2]}. Kindly login to your Travela
      account for details.`);
    case 'Guesthouse Check-In':
      return `<b style='text-transform: capitalize'>${
        msgDetail.senderName
      }</b> has checked in at ${msgDetail.guesthouseName} guesthouse at ${
        msgDetail.checkInTime
      } and would be spending ${
        msgDetail.durationOfStay
      } day(s). Click on the link below to view details`;
    case 'Guesthouse Check-out':
      return checKoutMessage(msgDetail);
    case 'Travel Readiness Document Verified':
      return travelReadinessVerification(msgDetail);
    case 'Edit Travel Document':
      return (`${msgDetail.details.user.name} just edited a travel document
      on Travela`);
    case 'Send delete email verification':
      return `${msgDetail.senderName} Just deleted a travel document`;
    case 'Send role assignment email notification':
      return `Congratulations you have just been assigned the role of
      <b>${msgDetail.details.role.toLowerCase()}</b> on Travela by <b>${
  msgDetail.details.assignerName
}</b>.
      Kindly login for a new experience.`;
    case 'Notify budget checker':
      return `A travel request <b>${msgDetail.details.id}</b> for <b>${
        msgDetail.senderName
      }</b> has now been approved
      by <b>${msgDetail.details.RequesterManager}
</b>. Please login to Travela to review the details and advise on availability
of budget for this trip.`;
    case 'Notify finance team':
      return `A travel request for <b>${
        msgDetail.details.requesterName
      }</b> has now been approved by ${
        msgDetail.details.budgetCheckerName
      }. Please make arrangements to make funds available for this trip.`;
    case 'Notify Travel Admins of Manager Approval':
      return `<b>${msgDetail.details.requesterName}</b>'s manager has approved \
      their request.<br/> <br/>
            Please make arrangements for the booked accommodation for this trip \
            and verify the trip accordingly.<br/>
            Thank you.`;
    case 'Notify Travel Admins Checklist Completion':
      return `<b>${msgDetail.senderName}</b> has completed the checklist for \
      <b>${msgDetail.details.requestId}</b> trip.</br>
                Please  login and verify the trip accordingly</br><br/>
                Thank you`;

    case 'Notify finance team members':
      return `
      <b> ${msgDetail.details.requesterName}</b> has now been verified as travel ready.

 Please view travel request and make arrangements to disburse travel stipend for this trip.

Thank you`;

    default:
      return '';
  }
};
export default switchMessage;
