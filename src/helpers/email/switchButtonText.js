const switchButtonText = (type) => {
  switch (type) {
    case 'New Requester Request':
      return 'Login to Travela';
    case 'New Request':
      return 'View Request';
    case 'Document':
      return 'View Document';
    case 'Trip Survey':
      return 'Start Survey';
    case 'Deleted Request':
      return 'View Notification';
    case 'Travel Readiness':
      return 'View Dashboard';
    case 'Guesthouse Check-out':
      return 'View Check Out Details';
    case 'Guesthouse Check-In':
      return 'View Check In Details';
    case 'Travel Readiness Document Verified':
      return 'View Document';
    case 'Edit Travel Document':
      return 'View Document';
    case 'Send role assignment email notification':
      return 'Login';
    case 'Approved':
      return 'View request status';
    case 'Budget Approval':
      return 'Fill Checklist';
    case 'Notify Travel Admins Checklist Completion':
      return 'Verify';
    case 'Notify Origin Tavel Team On Request Deletion':
      return 'View Notification';
    case 'Notify Destination Tavel Team On Request Deletion':
      return 'View Notification';
    case 'You were mentioned in a comment':
      return 'View Comment';
    case 'NO_PASSPORT':
      return 'View Dashboard';
    default:
      return 'View Request';
  }
};

export default switchButtonText;
