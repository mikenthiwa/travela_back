module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Checklists', 'createdBy');
    await queryInterface.addColumn('Checklists', 'createdBy', {
      type: Sequelize.STRING,
      references: {
        model: 'Users',
        key: 'userId',
        as: 'user'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addColumn('Checklists', 'deletedAt', {
      allowNull: true,
      type: Sequelize.DATE,
      paranoid: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Checklists', 'deletedAt');
  }
};
