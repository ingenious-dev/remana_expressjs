// Sequelize model imports
const { Sequelize } = require("sequelize");

const UserModel = require("./models/User");
const FederatedCredentialModel = require("./models/FederatedCredential");
const ActivityModel = require("./models/Activity");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./var/db/data.db", // Path to the file that will store the SQLite DB.
});

// Initialising the Model on sequelize
const User = UserModel.initialise(sequelize);
const FederatedCredential = FederatedCredentialModel.initialise(sequelize);
const Activity = ActivityModel.initialise(sequelize);

// <<<<<<<<<<>>>>>>>
// Consider using the pattern illustrated in "https://sequelize.org/docs/v6/core-concepts/model-basics/#extending-model"
// So you can define relation in the model file rather than here

FederatedCredential.User = FederatedCredential.belongsTo(User);
User.FederatedCredential = User.hasOne(FederatedCredential, { as: 'federated_credential' });

// + https://sequelize.org/docs/v6/advanced-association-concepts/creating-with-associations/#hasmany--belongstomany-association
Activity.hasMany(User, { as: 'participants_event_users' });
// <<<<<<<<<<>>>>>>>

module.exports = sequelize