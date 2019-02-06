// const
import { Meteor } from "meteor/meteor";
import { PubAndSubNames } from "../../../startup/both/constants/index";

const { GET_USER_LIST } = PubAndSubNames;

try {
  Meteor.publish(GET_USER_LIST, () => Meteor.users.find({}));
} catch (err) {
  throw new Meteor.Error(err);
}
