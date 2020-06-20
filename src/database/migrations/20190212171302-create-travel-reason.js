module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TravelReasons', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    title: {
      allowNull: false,
      type: Sequelize.STRING
    },
    description: {
      allowNull: true,
      type: Sequelize.STRING
    },
    createdBy: {
      type: Sequelize.INTEGER,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
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
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    }
  }),

  down: queryInterface => queryInterface.dropTable('TravelReasons')
};
