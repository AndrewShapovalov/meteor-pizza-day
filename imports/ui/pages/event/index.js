/* eslint consistent-return: 0 */

import "./index.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
// own helpers
import {
  getFriendlyDate, getEventStatus, getPathParams, getUserOrderStatus,
} from "imports/startup/both/helpers";
// collections
import { EventCollection } from "imports/api/event/event-collection";
// services
import { API, Notification } from "client/services";
// const
import { MethodNames, UserOrderStatuses, EventStatuses } from "imports/startup/both/constants";

const { success } = Notification;

const { CONFIRMED, UNCONFIRMED } = UserOrderStatuses;
const { ORDERED } = EventStatuses;
const { CONFIRM_EVENT_MENU, SEND_ORDER, CHANGE_EVENT_STATUS_TO_DELIVERED } = MethodNames;

// HEADER
Template.eventHeader.helpers({
  getEventStatus() {
    return getEventStatus(this.status);
  },
  getEventCreatedDate() {
    if (this.createdDate) {
      return getFriendlyDate(this.createdDate);
    }
  },
});

// USERS
Template.eventUserList.helpers({
  getUserName() {
    if (Meteor.userId() === this._id) {
      return "You";
    }
    return this.name;
  },
  getUserOrderStatus() {
    return getUserOrderStatus(this.orderStatus);
  },
  getUserOrderStatusColor() {
    return this.orderStatus === CONFIRMED;
  },
  getOrderedQuantity() {
    if (this.users) {
      const userListLength = this.users.length;
      const confirmedOrdersUserListLength = this.users.filter(x => x.orderStatus === CONFIRMED)
        .length;
      return `(${confirmedOrdersUserListLength} of ${userListLength})`;
    }
  },
});

// MENU
Template.eventMenuList.helpers({
  getMenuListForCurrentUser() {
    const currentUserId = Meteor.userId();
    if (this.users) {
      const user = this.users.find(x => x._id === currentUserId);
      return user.menu || [];
    }
    return [];
  },
  isUserOrderStatusConfirmed() {
    const eventId = getPathParams("_id");
    const event = EventCollection.findOne({ _id: eventId });
    const eventUser = event && event.users.find(x => x._id === Meteor.userId());
    return eventUser && eventUser.orderStatus === CONFIRMED;
  },
});

// CONFIRM BTN
Template.confirmButton.helpers({
  isUserOrderStatusUnconfirmed() {
    if (this && this.users) {
      const currentUser = this.users.find(x => x._id === Meteor.userId());
      return currentUser && currentUser.orderStatus === UNCONFIRMED;
    }
  },
});

Template.confirmButton.events({
  "click #eventMenuConfirmBtn"() {
    const currentUser = this.users.find(x => x._id === Meteor.userId());
    const { menu } = currentUser;

    const updatedMenu = menu.map((x) => {
      const menuId = x._id;
      const amountValue = $(`#${menuId}`).val();
      return { ...x, amount: amountValue };
    });

    const eventId = getPathParams("_id");

    API.callMethod(CONFIRM_EVENT_MENU, [eventId, updatedMenu], (err) => {
      if (err) {
        return;
      }
      success(null, "Menu confirmed!");
    });
  },
});

// SEND ORDER BTN
Template.sendOrderButton.helpers({
  isEventStatusOrdered() {
    // show 'send order' btn if event status === ORDERED and current user created this event
    return this.status === ORDERED && this.creatorId === Meteor.userId();
  },
});

Template.sendOrderButton.events({
  "click #eventMenuSendOrderBtn"() {
    const eventId = getPathParams("_id");
    API.callMethod(SEND_ORDER, [eventId], (err) => {
      if (err) {
        return;
      }
      success(null, "Order sent!");
      // change event status to DELIVERED and just remove event
      setTimeout(() => {
        API.callMethod(CHANGE_EVENT_STATUS_TO_DELIVERED, [eventId], (error) => {
          if (error) {
            return;
          }
          success(null, "Order DELIVERED! Event removed!");
        });
      }, 5000);
    });
  },
});
