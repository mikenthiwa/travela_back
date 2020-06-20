module.exports = {
  up: queryInterface => queryInterface
    .sequelize.query("ALTER TYPE \"enum_Requests_status\" ADD VALUE 'Verified'"),

  down: (queryInterface) => {
    const query = "DELETE FROM pg_enum WHERE enumlabel = 'Verified'";
    return queryInterface.sequelize.query(query);
  }
};
