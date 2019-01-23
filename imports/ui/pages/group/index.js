import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
// own helpers
import { getPathParams } from "helpers/index";
// const
import { PubAndSubNames, MethodNames } from "constants/index";
import UserGroupCollection from "imports/api/user-group/user-group-collection";
import "./index.html";
import "../../components/index";

const { GET_USER_LIST } = PubAndSubNames;
const { REMOVE_USER_FROM_GROUP, ADD_USER_TO_GROUP } = MethodNames;

Template.group.onCreated(() => Meteor.subscribe(GET_USER_LIST));

Template.group.events({
  "click .list-group-item__own"(event) {
    event.preventDefault();
    const groupId = getPathParams("_id");
    const { id, name } = this;
    const user = {
      id,
      name,
    };
    Meteor.apply(REMOVE_USER_FROM_GROUP, [groupId, user], (err) => {
      if (err) {
        throw new Meteor.Error(err);
      }
    });
  },
  "click a"(event) {
    event.preventDefault();
    const groupId = getPathParams("_id");
    const { _id, name } = this;
    const user = {
      _id,
      name,
    };
    Meteor.apply(ADD_USER_TO_GROUP, [groupId, user], (err) => {
      if (err) {
        throw new Meteor.Error(err);
      }
    });
  },
});

Template.group.helpers({
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
