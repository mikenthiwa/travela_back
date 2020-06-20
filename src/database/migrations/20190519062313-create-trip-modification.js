
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TripModifications', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: false
    },
    requestId: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'Requests',
        key: 'id',
        as: 'request'
      }
    },
    type: {
      allowNull: false,
      type: Sequelize.ENUM('Cancel Trip', 'Modify Dates'),
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('Open', 'Approved', 'Rejected'),
      defaultValue: 'Open',
    },
    approverId: {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
        as: 'approvedBy'
      }
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: queryInterface => queryInterface.dropTable('TripModifications')
};
