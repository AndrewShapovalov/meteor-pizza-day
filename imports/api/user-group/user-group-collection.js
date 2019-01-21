import { Mongo } from "meteor/mongo";

const UserGroupCollection = new Mongo.Collection("user_group");

export default UserGroupCollection;
