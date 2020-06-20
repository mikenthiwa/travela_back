module.exports = (sequelize, DataTypes) => {
  const ReminderDisableReason = sequelize.define('ReminderDisableReason',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      reason: {
        allowNull: false,
        type: DataTypes.STRING
      },
    }, {});
  ReminderDisableReason.associate = (models) => {
    ReminderDisableReason.belongsTo(models.ReminderEmailTemplate, {
      foreignKey: 'reminderEmailTemplateId',
      as: 'disableReasons'
    });
    ReminderDisableReason.belongsTo(models.Condition, {
      foreignKey: 'conditionId',
      as: 'reasons'
    });
  };
  return ReminderDisableReason;
};
