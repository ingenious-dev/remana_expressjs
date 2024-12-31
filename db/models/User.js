const { DataTypes } = require("sequelize");

const UserModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_picture: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  display_empty_spaces: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
};

module.exports = {
  initialise: (sequelize) => {
    const model = sequelize.define(
      "user",
      UserModel,
      // + https://stackoverflow.com/questions/14653913/rename-node-js-sequelize-timestamp-columns/31078884#31078884
      // + https://sequelize.org/api/v6/class/src/model.js~model#static-method-init
      {
        updatedAt: 'updated_at',
        createdAt: 'created_at'
      }
    )
    this.model = model
    return model;
  },

  createUser: (user) => {
    return this.model.create(user);
  },

  findUser: (query) => {
    return this.model.findOne({
      where: query,
    });
  },

  updateUser: (query, updatedValue) => {
    return this.model.update(updatedValue, {
      where: query,
    });
  },

  findAllActivities: (query) => {
    return this.model.findAll({
      where: query
    });
  },

  deleteUser: (query) => {
    return this.model.destroy({
      where: query
    });
  }
}
