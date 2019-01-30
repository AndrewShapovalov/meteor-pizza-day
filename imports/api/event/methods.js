/* eslint meteor/audit-argument-checks: 0, no-param-reassign: 0 */
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
// const
import { MethodNames, EventStatuses, UserOrderStatuses } from "constants/index";
// collection
import UserGroupCollection from "imports/api/groups/user-group-collection";
import { EventCollection } from "imports/api/event/event-collection";

const { CREATE_EVENT } = MethodNames;
const { ORDERING } = EventStatuses;
const { UNCONFIRMED } = UserOrderStatuses;

Meteor.methods({
  [CREATE_EVENT](groupId, name) {
    check(groupId, String);
    check(name, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    const currentGroup = UserGroupCollection.findOne({ _id: groupId });
    const { users, menu } = currentGroup;
    const preparedUsers = users.map(x => ({ ...x, orderStatus: UNCONFIRMED }));
    const preparedMenu = menu.map(x => ({ ...x, count: 0 }));

    const dataForStorage = {
      name,
      groupId,
      preparedMenu,
      preparedUsers,
      status: ORDERING,
      creatorId: this.userId,
      createdDate: new Date(),
    };

    EventCollection.insert(dataForStorage);
  },
});
