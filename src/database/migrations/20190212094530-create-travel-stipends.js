module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TravelStipends', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    amount: {
      type: Sequelize.INTEGER
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
      allowNull: true,
      type: Sequelize.DATE
    },
    createdBy: {
      type: Sequelize.STRING,
      onDelete: 'set null',
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
        as: 'user',
      },
    },
    centerId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: false,
      references: {
        model: 'Centers',
        key: 'id',
        as: 'centerId',
      },
    }
  }),
  down: queryInterface => queryInterface.dropTable('TravelStipends')
};
