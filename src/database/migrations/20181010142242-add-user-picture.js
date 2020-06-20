module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Users', 'picture',
    {
      allowNull: false,
      type: Sequelize.STRING,
      defaultValue: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png'
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Users', 'picture')
};
