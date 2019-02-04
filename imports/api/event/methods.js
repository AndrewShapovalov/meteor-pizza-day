/* eslint meteor/audit-argument-checks: 0, no-param-reassign: 0, consistent-return: 0 */
import { Email } from "meteor/email";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { SSR } from "meteor/meteorhacks:ssr";
// helpers
import { getFriendlyDate } from "imports/startup/both/helpers";
// const
import {
  MethodNames,
  EventStatuses,
  UserOrderStatuses,
} from "imports/startup/both/constants/index";
// collection
import UserGroupCollection from "imports/api/groups/user-group-collection";
import { EventCollection } from "imports/api/event/event-collection";

const {
  CHANGE_EVENT_STATUS_TO_DELIVERED,
  CREATE_EVENT,
  CONFIRM_EVENT_MENU,
  SEND_ORDER,
} = MethodNames;
const {
  ORDERING, ORDERED, DELIVERING, DELIVERED,
} = EventStatuses;
const { UNCONFIRMED, CONFIRMED } = UserOrderStatuses;

// own helpers
const getOrderedMenu = (event, participantId) => {
  const { menu } = event.users.find(x => x._id === participantId);
  return menu.filter(x => Number(x.amount) > 0);
};

const getOrderedTotalPrice = menu => menu
  .reduce((sum, menuItem) => {
    const price = Number(menuItem.price);
    const amount = Number(menuItem.amount);
    return sum + price * amount;
  }, 0)
  .toFixed(2);

const getParticipantEmail = participantId => Meteor.users.findOne({ _id: participantId }).services.google.email;

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
  [SEND_ORDER](eventId) {
    check(eventId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    EventCollection.update(
      { _id: eventId },
      {
        $set: {
          status: DELIVERING,
        },
      },
    );
  },
  [CHANGE_EVENT_STATUS_TO_DELIVERED](eventId) {
    check(eventId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    EventCollection.update(
      { _id: eventId },
      {
        $set: {
          status: DELIVERED,
        },
      },
    );

    EventCollection.remove({ _id: eventId });
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
      },
    );

    let isAllParticipantsOrdered = false;

    EventCollection.find({ _id: eventId }).forEach(function(event) {
      isAllParticipantsOrdered = event.users.every(x => x.orderStatus === CONFIRMED);
    });

    const event = EventCollection.findOne({ _id: eventId });
    const eventName = event.name;
    const eventCreatorId = event.creatorId;
    const eventCreatedDate = getFriendlyDate(event.createdDate);

    const sendEmail = async (to, html, content) => {
      this.unblock();
      const from = "pizzadayemail@gmail.com";
      const subject = "Pizza Event Day!";
      SSR.compileTemplate("email-content", Assets.getText(html));
      const htmlForSend = SSR.render("email-content", content);
      Email.send({
        to,
        from,
        subject,
        html: htmlForSend,
      });
    };

    const sendEmailToEventCreator = async () => {
      const eventCreatorEmail = getParticipantEmail(eventCreatorId);
      const orderedMenu = getOrderedMenu(event, eventCreatorId);
      const orderedTotalPrice = getOrderedTotalPrice(orderedMenu);
      const menuList = UserGroupCollection.findOne({ _id: event.groupId }).menu.slice();

      event.users.forEach((user) => {
        user.menu.forEach((menu) => {
          const index = menuList.findIndex(x => x._id === menu._id);
          menuList[index].amount += Number(menu.amount);
        });
      });

      const summaryOrderedMenu = menuList.filter(x => Number(x.amount) > 0);
      const summaryOrderTotalPrice = getOrderedTotalPrice(summaryOrderedMenu);
      const orderedQuantity = summaryOrderedMenu.reduce(
        (sum, menu) => sum + Number(menu.amount),
        0,
      );

      const content = {
        eventName,
        eventCreatedDate,
        orderedTotalPrice,
        orderedMenu,
        orderedQuantity,
        summaryOrderedMenu,
        summaryOrderTotalPrice,
      };
      return sendEmail(eventCreatorEmail, "event-owner-email.html", content);
    };

    const sendEmailToEveryParticipants = async () => {
      event.users.forEach((participant) => {
        if (participant._id !== eventCreatorId) {
          const participantEmail = getParticipantEmail(participant._id);
          const orderedMenu = participant.menu.filter(x => Number(x.amount) > 0);
          const orderedTotalPrice = getOrderedTotalPrice(orderedMenu);
          const content = {
            eventName,
            eventCreatedDate,
            orderedTotalPrice,
            orderedMenu,
          };
          return sendEmail(participantEmail, "event-participants-email.html", content);
        }
        sendEmailToEventCreator();
      });
    };

    if (isAllParticipantsOrdered) {
      try {
        // if all participants confirm order - event status become ORDERED
        EventCollection.update(
          { _id: eventId },
          {
            $set: {
              status: ORDERED,
            },
          },
        );
        sendEmailToEveryParticipants();
      } catch (err) {
        throw new Meteor.Error(err);
      }
    }
  },
});
