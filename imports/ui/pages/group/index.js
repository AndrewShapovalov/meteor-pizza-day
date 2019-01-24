import "./index.html";
import "../../components/index";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
// services
import { API } from "client/services";
// own helpers
import { getPathParams, getGroupOwnerId } from "helpers/index";
// const
import { PubAndSubNames, MethodNames } from "constants/index";
import UserGroupCollection from "imports/api/user-group/user-group-collection";

const { GET_USER_LIST } = PubAndSubNames;
const { REMOVE_USER_FROM_GROUP, ADD_USER_TO_GROUP } = MethodNames;

Template.group.onCreated(() => {
  try {
    Meteor.subscribe(GET_USER_LIST);
  } catch (err) {
    throw new Meteor.Error(err);
  }
});

Template.group.events({
  "click #removeUserFromGroupBtn"(event) {
    event.preventDefault();
    const groupId = getPathParams("_id");
    const { _id, name } = this;
    const user = {
      _id,
      name,
    };
    API.callMethod(REMOVE_USER_FROM_GROUP, [groupId, user]);
  },
  "click a"(event) {
    event.preventDefault();
    const groupId = getPathParams("_id");
    const { _id, name } = this;
    const user = {
      _id,
      name,
    };
    API.callMethod(ADD_USER_TO_GROUP, [groupId, user]);
  },
});

Template.group.helpers({
  isCurrentUser() {
    return this._id === Meteor.userId();
  },
  isAddBtn() {
    const groupId = getPathParams("_id");
    const ownerId = getGroupOwnerId(groupId);
    const currentUserId = Meteor.userId();
    return ownerId === currentUserId;
  },
  isRemoveBtn() {
    const groupId = getPathParams("_id");
    const ownerId = getGroupOwnerId(groupId);
    const currentUserId = Meteor.userId();
    return currentUserId === ownerId && currentUserId !== this._id
  },
  userCollection: () => {
    const userList = Meteor.users.find().fetch();
    const selectedGroup = UserGroupCollection.findOne({ _id: Router.current().params._id });
    const preparedUserList = userList.map(a => ({ _id: a._id, name: a.profile.name }));
    const usersOfCurrentGroup = selectedGroup && selectedGroup.users;
    return preparedUserList.filter(
      b => !(usersOfCurrentGroup && usersOfCurrentGroup.some(c => c.id === b._id)),
    );
  },
});
