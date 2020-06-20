module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Requests', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING
    },
    manager: {
      allowNull: false,
      type: Sequelize.STRING
    },
    gender: {
      allowNull: false,
      type: Sequelize.STRING
    },
    department: {
      allowNull: false,
      type: Sequelize.STRING
    },
    role: {
      allowNull: false,
      type: Sequelize.STRING
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('Open', 'Approved', 'Rejected'),
      defaultValue: 'Open',
    },
    userId: {
      allowNull: false,
      type: Sequelize.STRING
    },
    tripType: {
      allowNull: false,
      type: Sequelize.ENUM,
      values: ['return', 'oneWay', 'multi']
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('Requests')
};
