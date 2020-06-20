module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Comments', 'userId',
    {
      type: Sequelize.INTEGER,
      onDelete: 'set null',
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
        as: 'user',
      },
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Comments', 'userId')
};
