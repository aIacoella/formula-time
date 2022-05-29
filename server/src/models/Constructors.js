import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Constructor = sequelize.define(
    "constructors",
    {
      constructor_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      constructor_ref: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      nationality: {
        type: DataTypes.STRING,
      },
      url: {
        type: DataTypes.TEXT,
      },
    },
    {
      timestamps: false,
    }
  );
  return Constructor;
};
