export default (sequelize, DataTypes) => {
  const HelpResources = sequelize.define('HelpResources', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    link: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  }, {});
  return HelpResources;
};
