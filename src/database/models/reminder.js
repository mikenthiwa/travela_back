export default (sequelize, DataTypes) => {
  const Reminder = sequelize.define(
    'Reminder', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      frequency: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Frequency cannot be empty'
          }
        }
      },
    }, {}
  );

  Reminder.associate = (models) => {
    Reminder.belongsTo(models.Condition, {
      foreignKey: 'conditionId',
      as: 'condition'
    });

    Reminder.belongsTo(models.ReminderEmailTemplate, {
      foreignKey: 'reminderEmailTemplateId',
      as: 'emailTemplate'
    });
  };

  return Reminder;
};
