
module.exports = {
  up: queryInterface => Promise.all([
    queryInterface.removeConstraint(
      'Users', 'custom_unique_constraint_name'
    ),
  ]),
  down: queryInterface => queryInterface.addConstraint(
    'Users', ['userId'], {
      type: 'unique',
      name: 'custom_unique_constraint_name'
    }
  ),
};
