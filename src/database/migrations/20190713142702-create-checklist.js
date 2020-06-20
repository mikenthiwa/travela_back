module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Checklists', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    createdBy: {
      type: Sequelize.STRING,
      references: {
        model: 'Users',
        key: 'userId',
        as: 'user'
      }
    },
    name: {
      type: Sequelize.STRING
    },
    config: {
      type: Sequelize.JSONB
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
  down: queryInterface => queryInterface.dropTable('Checklists')
};
