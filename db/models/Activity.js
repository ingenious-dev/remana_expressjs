const { DataTypes } = require("sequelize");
const { UserModel } = require("./User");

const ActivityModel = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
    primaryKey: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  agenda_or_body: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_activity: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // participants_event_users: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  participants_emails: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
};

module.exports = {
  initialise: (sequelize) => {
    const model = sequelize.define(
      "activity",
      ActivityModel,
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

  createActivity: (user) => {
    return this.model.create(user);
  },

  findActivity: (query) => {
    return this.model.findOne({
      where: query,
    });
  },

  updateActivity: (query, updatedValue) => {
    return this.model.update(updatedValue, {
      where: query,
    });
  },

  findAllActivities: (query) => {
    return this.model.findAll({
      where: query
    });
  },

  deleteActivity: (query) => {
    return this.model.destroy({
      where: query
    });
  }
}
