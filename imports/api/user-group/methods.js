/* eslint meteor/audit-argument-checks: 0 */

import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { MethodNames } from "constants/index";
import UserGroupCollection from "imports/api/user-group/user-group-collection";

const {
  GET_GROUP_BY_ID,
  CREATE_USER_GROUP,
  ADD_USER_TO_GROUP,
  REMOVE_USER_FROM_GROUP,
} = MethodNames;

const checkGroupIdAndUser = (groupId, user) => {
  check(user, Object);
  const id = user._id || user.id;
  check(id, String);
  check(user.name, String);
  check(groupId, String);
};

const getGroupOwnerId = (groupId) => {
  const group = UserGroupCollection.findOne({ _id: groupId });
  return group && group.ownerId;
};

Meteor.methods({
  [CREATE_USER_GROUP]({ name, logo }) {
    check(name, String);
    check(logo, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    const currentUser = Meteor.user();
    const userId = Meteor.userId();

    const dataForStorage = {
      name,
      logo,
      ownerId: userId,
      users: [
        {
          id: userId,
          name: currentUser && currentUser.profile.name,
        },
      ],
      items: [],
    };

    UserGroupCollection.insert(dataForStorage);
  },
});

Meteor.methods({
  [ADD_USER_TO_GROUP](groupId, user) {
    checkGroupIdAndUser(groupId, user);
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    if (getGroupOwnerId(groupId) !== this.userId) {
      throw new Meteor.Error("You aren't owner of the group");
    }
    UserGroupCollection.update({ _id: groupId }, { $push: { users: user } });
  },
});

Meteor.methods({
  [REMOVE_USER_FROM_GROUP](groupId, user) {
    // checkGroupIdAndUser(groupId, user); // TODO: add
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    if (getGroupOwnerId(groupId) !== this.userId) {
      throw new Meteor.Error("You aren't owner of the group");
    }
    UserGroupCollection.update({ _id: groupId }, { $pull: { users: user } });
  },
});

Meteor.methods({
  [GET_GROUP_BY_ID](groupId) {
    check(groupId, String);
    return UserGroupCollection.find({ _id: groupId });
  },
});
