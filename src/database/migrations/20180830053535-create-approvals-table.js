module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Approvals', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER
    },
    requestId: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: 'Requests',
        key: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      validate: {
        notEmpty: {
          args: true,
          msg: 'requestId cannot be empty'
        }
      }
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('Open', 'Approved', 'Rejected'),
      defaultValue: 'Open',
    },
    approverId: {
      // FIX: In future, this should be the manager's email address or unique ID
      allowNull: false,
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'approverId cannot be empty'
        }
      },
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    }
  }),

  down: (queryInterface, Sequelize) => { // eslint-disable-line
    return queryInterface.dropTable('Approvals');
  }
};
