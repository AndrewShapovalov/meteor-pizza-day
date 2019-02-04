/* eslint meteor/audit-argument-checks: 0, no-param-reassign: 0 */
import { Random } from "meteor/random";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
// const
import { MethodNames, ErrorReasons } from "constants";
// collections
import UserGroupCollection from "imports/api/groups/user-group-collection";
import { EventCollection } from "imports/api/event/event-collection";
// own helpers
import { getGroupOwnerId } from "helpers";

const {
  GET_GROUP_BY_ID,
  CREATE_GROUP,
  REMOVE_GROUP,
  ADD_USER_TO_GROUP,
  CREATE_MENU_ITEM,
  UPDATE_MENU_ITEM,
  REMOVE_MENU_FROM_GROUP,
  REMOVE_USER_FROM_GROUP,
} = MethodNames;

const { GROUP_NAME_IS_ALREADY_EXISTS } = ErrorReasons;

const checkUser = (user) => {
  check(user, Object);
  const { _id, name } = user;
  check(_id, String);
  check(name, String);
};

const checkMenuItem = (menuItem) => {
  check(menuItem, Object);
  const { _id, name, price } = menuItem;
  check(_id, String);
  check(name, String);
  check(price, String);
};

Meteor.methods({
  toConsole(str) {
    console.log(str);
  },
  [GET_GROUP_BY_ID](groupId) {
    check(groupId, String);
    return UserGroupCollection.find({ _id: groupId });
  },
  [REMOVE_GROUP](groupId) {
    check(groupId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    if (getGroupOwnerId(groupId) !== this.userId) {
      throw new Meteor.Error("You aren't owner of the group");
    }

    UserGroupCollection.remove({ _id: groupId });

    EventCollection.find({}).forEach(function(event) {
      const eventId = event._id;
      if (event.groupId === groupId) {
        EventCollection.remove({ _id: eventId });
      }
    });
  },
  [CREATE_GROUP]({ name, logo }) {
    check(name, String);
    check(logo, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    const isGroupAlreadyExistsForCurrentUser = UserGroupCollection.findOne({
      name,
      ownerId: this.userId,
    });
    if (isGroupAlreadyExistsForCurrentUser) {
      throw new Meteor.Error("Name has already exists!", GROUP_NAME_IS_ALREADY_EXISTS);
    }

    const menu = JSON.parse(Assets.getText("menu.json"));

    const currentUser = Meteor.user();
    const userId = Meteor.userId();

    const dataForStorage = {
      name,
      logo,
      menu,
      createdAt: new Date(),
      items: [],
      ownerId: userId,
      users: [
        {
          _id: userId,
          name: currentUser && currentUser.profile.name,
        },
      ],
    };

    UserGroupCollection.insert(dataForStorage);
  },
  [ADD_USER_TO_GROUP](groupId, user) {
    check(groupId, String);
    checkUser(user);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (getGroupOwnerId(groupId) !== this.userId) {
      throw new Meteor.Error("You aren't owner of the group");
    }
    UserGroupCollection.update({ _id: groupId }, { $push: { users: user } });
  },
  [REMOVE_USER_FROM_GROUP](groupId, user) {
    check(groupId, String);
    checkUser(user);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (getGroupOwnerId(groupId) !== this.userId) {
      throw new Meteor.Error("You aren't owner of the group");
    }
    UserGroupCollection.update({ _id: groupId }, { $pull: { users: user } });
  },
  [UPDATE_MENU_ITEM](groupId, menuItem) {
    check(groupId, String);
    checkMenuItem(menuItem);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    UserGroupCollection.update(
      { _id: groupId, "menu._id": menuItem._id },
      {
        $set: {
          "menu.$.name": menuItem.name,
          "menu.$.price": menuItem.price,
        },
      },
    );
  },
  [CREATE_MENU_ITEM](groupId, menuItem) {
    check(groupId, String);
    check(menuItem, Object);
    const { name, price } = menuItem;
    check(name, String);
    check(price, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    menuItem._id = Random.id();
    UserGroupCollection.update(
      { _id: groupId },
      {
        $push: {
          menu: {
            $each: [menuItem],
            $position: 0,
          },
        },
      },
    );
  },
  [REMOVE_MENU_FROM_GROUP](groupId, menuItem) {
    check(groupId, String);
    checkMenuItem(menuItem);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    UserGroupCollection.update({ _id: groupId }, { $pull: { menu: menuItem } });
  },
});
