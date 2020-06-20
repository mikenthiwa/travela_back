
export default (sequelize, DataTypes) => {
  const Occupation = sequelize.define('Occupation', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    occupationName: {
      allowNull: false,
      type: DataTypes.STRING,
    }
  });

  return Occupation;
};
