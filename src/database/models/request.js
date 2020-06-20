export default (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Name cannot be empty',
        },
      },
    },
    tripType: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: ['return', 'oneWay', 'multi']
    },
    manager: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Manager name cannot be empty',
        },
      },
    },
    gender: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Gender cannot be empty',
        },
      },
    },
    department: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Department cannot be empty',
        },
      },
    },
    role: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Role cannot be empty',
        },
      },
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM('Open', 'Approved', 'Rejected', 'Verified'),
      defaultValue: 'Open',
      validate: {
        notEmpty: {
          args: true,
          msg: 'Status cannot be empty',
        },
      },
    },
    userId: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'User ID cannot be empty',
        },
      },
    },
    picture: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Picture cannot be empty',
        },
      },
    },
    stipend: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    stipendBreakdown: {
      allowNull: false,
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    budgetStatus: {
      allowNull: false,
      type: DataTypes.ENUM('Open', 'Approved', 'Rejected'),
      defaultValue: 'Open',
      validate: {
        notEmpty: {
          args: true,
          msg: 'Budget Status cannot be empty',
        },
      },
    }
  }, { paranoid: true });

  Request.associate = (models) => {
    Request.hasMany(models.Comment, {
      foreignKey: 'requestId',
      as: 'comments',
    });
    Request.hasMany(models.Trip, {
      foreignKey: 'requestId',
      as: 'trips',
    });
    Request.hasMany(models.ChangedRoom, {
      foreignKey: 'requestId',
      as: 'changedRooms',
    });
    Request.hasMany(models.TripModification, {
      foreignKey: 'requestId',
      as: 'modifications'
    });
    Request.belongsTo(models.TripModification, {
      foreignKey: 'tripModificationId',
      as: 'currentModification'
    });
    Request.hasOne(models.DynamicChecklistSubmissions, {
      foreignKey: 'requestId',
      as: 'dynamicChecklistSubmission',
    });
  };
  return Request;
};
