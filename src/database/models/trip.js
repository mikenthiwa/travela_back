export default (sequelize, DataTypes) => {
  const Trip = sequelize.define(
    'Trip',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING
      },
      origin: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Origin cannot be empty'
          }
        }
      },
      destination: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Destination cannot be empty'
          }
        }
      },
      departureDate: {
        allowNull: false,
        type: DataTypes.DATEONLY
      },
      returnDate: {
        allowNull: true,
        type: DataTypes.DATEONLY
      },
      checkStatus: {
        allowNull: false,
        defaultValue: 'Not Checked In',
        type: DataTypes.ENUM('Not Checked In', 'Checked In', 'Checked Out')
      },
      checkInDate: {
        allowNull: true,
        type: DataTypes.DATE
      },
      checkOutDate: {
        allowNull: true,
        type: DataTypes.DATE
      },
      accommodationType: {
        allowNull: false,
        type: DataTypes.ENUM('Residence', 'Hotel Booking', 'Not Required'),
        defaultValue: 'Residence'
      },
      lastNotifyDate: {
        allowNull: true,
        type: DataTypes.DATE
      },
      notificationCount: {
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.INTEGER
      },
      travelCompletion: {
        allowNull: false,
        defaultValue: 'false',
        type: DataTypes.ENUM('true', 'false')
      },
      otherTravelReasons: {
        allowNull: true,
        type: DataTypes.STRING
      }
    },
    { paranoid: true }
  );
  Trip.associate = (models) => {
    Trip.belongsTo(models.Bed, {
      allowNull: true,
      foreignKey: 'bedId',
      as: 'beds'
    });
    Trip.belongsTo(models.Request, {
      foreignKey: 'requestId',
      as: 'request',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Trip.hasMany(models.ChecklistSubmission, {
      foreignKey: 'tripId',
      as: 'submissions'
    });
    Trip.hasMany(models.ChangedRoom, {
      foreignKey: 'tripId',
      as: 'changedRooms'
    });
    Trip.belongsTo(models.TravelReason, {
      foreignKey: 'travelReasons',
      targetId: 'id',
      as: 'reasons'
    });
  };
  return Trip;
};
