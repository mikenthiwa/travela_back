class ReminderUtils {
  static sendSuccessResponse(res, reminderCondition, updatedReminder) {
    return res.status(201).json({
      success: true,
      message: 'Reminder successfully upated',
      reminder: {
        condition: reminderCondition,
        reminders: updatedReminder
      }
    });
  }
}

export default ReminderUtils;
