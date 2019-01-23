// const
import { PubAndSubNames } from "constants/index";
import { Meteor } from "meteor/meteor";

const { GET_USER_LIST } = PubAndSubNames;

Meteor.publish(GET_USER_LIST, () => Meteor.users.find({}));
