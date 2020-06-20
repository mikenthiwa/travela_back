module.exports = {
  up: queryInterface => (
    queryInterface.removeColumn('Comments', 'userId')
  ),
  down: (queryInterface, Sequelize) => (
    queryInterface.addColumn('Comments', 'userId',
      {
        type: Sequelize.STRING,
        onDelete: 'set null',
        allowNull: true,
        references: {
          model: 'Users',
          key: 'userId',
          as: 'users',
        },
      })
  )
};
