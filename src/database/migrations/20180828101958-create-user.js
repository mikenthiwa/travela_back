module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER,
    },
    fullName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING,
    },
    passportName: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    department: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    occupation: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    manager: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    gender: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    location: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    roleId: {
      type: Sequelize.INTEGER,
      onDelete: 'set null',
      allowNull: true,
      defaultValue: 401938,
      references: {
        model: 'Roles',
        key: 'id',
        as: 'roleId',
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('Users'),
};
