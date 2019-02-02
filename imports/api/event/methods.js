/* eslint meteor/audit-argument-checks: 0, no-param-reassign: 0 */
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
// const
import { MethodNames, EventStatuses, UserOrderStatuses } from "constants/index";
// collection
import UserGroupCollection from "imports/api/groups/user-group-collection";
import { EventCollection } from "imports/api/event/event-collection";

const { CREATE_EVENT, CONFIRM_EVENT_MENU, SEND_ORDER } = MethodNames;
const { ORDERING, ORDERED, DELIVERING } = EventStatuses;
const { UNCONFIRMED, CONFIRMED } = UserOrderStatuses;

Meteor.methods({
  [CREATE_EVENT](groupId, name) {
    check(groupId, String);
    check(name, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    const currentGroup = UserGroupCollection.findOne({ _id: groupId });
    const { users, menu } = currentGroup;
    const preparedMenu = menu.map(x => ({ ...x, amount: 0 }));
    const preparedUsers = users.map(x => ({ ...x, menu: preparedMenu, orderStatus: UNCONFIRMED }));

    const dataForStorage = {
      name,
      groupId,
      users: preparedUsers,
      status: ORDERING,
      creatorId: this.userId,
      createdDate: new Date(),
    };

    EventCollection.insert(dataForStorage);
  },
  [CONFIRM_EVENT_MENU](eventId, updatedMenu) {
    check(eventId, String);
    check(updatedMenu, Array);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    EventCollection.update(
      { _id: eventId, "users._id": this.userId },
      {
        $set: {
          "users.$.menu": updatedMenu,
          "users.$.orderStatus": CONFIRMED,
        },
      }
    );

    let isAllParticipantsOrdered = false;

    EventCollection.find({ _id: eventId }).forEach(function (event) {
      isAllParticipantsOrdered =  event.users.every(x => x.orderStatus === CONFIRMED)
    });

    // if all participants confirm order - event status become ORDERED
    if (isAllParticipantsOrdered) {
      EventCollection.update(
        { _id: eventId, },
        {
          $set: {
            "status": ORDERED,
          },
        }
      );
    }
  },
  [SEND_ORDER](eventId) {
    check(eventId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    EventCollection.update(
      { _id: eventId, },
      {
        $set: {
          "status": DELIVERING,
        },
      }
    );
  },
});
