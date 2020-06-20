export default (sequelize, DataTypes) => {
  const ReminderEmailTemplate = sequelize.define('ReminderEmailTemplate', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Name cannot be empty'
        }
      }
    },
    from: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Sender email cannot be empty'
        }
      }
    },
    cc: {
      allowNull: true,
      type: DataTypes.STRING,
      get() {
        return (this.getDataValue('cc') || '').split(',');
      }
    },
    subject: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Email subject cannot be empty'
        }
      }
    },
    message: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Email message cannot be empty'
        }
      }
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, { paranoid: true });

  ReminderEmailTemplate.associate = (models) => {
    ReminderEmailTemplate.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    ReminderEmailTemplate.hasMany(models.ReminderDisableReason, {
      foreignKey: 'reminderEmailTemplateId',
      as: 'disableReasons'
    });
  };
  return ReminderEmailTemplate;
};
