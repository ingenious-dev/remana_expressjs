const { DataTypes } = require("sequelize");

const FederatedCredentialModel = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

module.exports = {
  initialise: (sequelize) => {
    const model = sequelize.define(
      "federated_credential",
      FederatedCredentialModel,
      // + https://stackoverflow.com/questions/14653913/rename-node-js-sequelize-timestamp-columns/31078884#31078884
      // + https://sequelize.org/api/v6/class/src/model.js~model#static-method-init
      {
        updatedAt: 'updated_at',
        createdAt: 'created_at',
        // + https://sequelize.org/docs/v6/other-topics/indexes/
        indexes: [
          // Create a unique index on email
          {
            unique: true,
            fields: ['provider', 'subject'],
          },
        ],
      }
    )
    this.model = model
    return model;
  },

  createFederatedCredential: (user) => {
    return this.model.create(user);
  },

  findFederatedCredential: (query) => {
    return this.model.findOne({
      where: query,
    });
  },

  updateFederatedCredential: (query, updatedValue) => {
    return this.model.update(updatedValue, {
      where: query,
    });
  },

  findAllFederatedCredentials: (query) => {
    return this.model.findAll({
      where: query
    });
  },

  deleteFederatedCredential: (query) => {
    return this.model.destroy({
      where: query
    });
  }
}
