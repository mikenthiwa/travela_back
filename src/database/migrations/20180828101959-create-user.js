module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.addConstraint(
    'Users', ['userId'], {
      type: 'unique',
      name: 'custom_unique_constraint_name'
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Users', 'userId')
};
