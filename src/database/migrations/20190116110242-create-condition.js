module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Conditions', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    conditionName: {
      allowNull: false,
      type: Sequelize.STRING
    },
    documentType: {
      allowNull: false,
      type: Sequelize.STRING
    },
    userId: {
      type: Sequelize.STRING,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
        as: 'user',
      },
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

  down: queryInterface => queryInterface.dropTable('Conditions')
};
