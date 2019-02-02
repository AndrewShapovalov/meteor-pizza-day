import "./index.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
// own helpers
import { getEventStatus, getPathParams, getUserOrederStatus } from "helpers";
// services
import { API } from "client/services";
// const
import { UserOrderStatuses, EventStatuses } from "constants";
import { MethodNames } from "constants";

const { CONFIRMED, UNCONFIRMED } = UserOrderStatuses;
const { ORDERED } = EventStatuses;
const { CONFIRM_EVENT_MENU, SEND_ORDER } = MethodNames;

// HEADER
Template.eventHeader.helpers({
  getEventStatus() {
    return getEventStatus(this.status)
  },
  getEventCreatedDate() {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (this.createdDate) {
      return this.createdDate.toLocaleString("en-US", options)
    }
  }
});

// USERS
Template.eventUserList.helpers({
  getUserName() {
    if (Meteor.userId() === this._id) {
      return "You"
    }
    return this.name
  },
  getUserOrderStatus() {
    return getUserOrederStatus(this.orderStatus)
  },
  getUserOrderStatusColor() {
    return this.orderStatus === CONFIRMED
  },
  getOrderedQuantity() {
    if (this.users) {
      const userListLength = this.users.length;
      const confirmedOrdersUserListLength = this.users.filter(x => x.orderStatus === CONFIRMED).length;
      return `(${confirmedOrdersUserListLength} of ${userListLength})`
    }

  }
});

// MENU
Template.eventMenuList.helpers({
  getMenuListForCurrentUser() {
    const currentUserId = Meteor.userId();
    if (this.users) {
      const user = this.users.find(x => x._id === currentUserId);
      return user.menu;
    }
    return []
  }
});

// CONFIRM BTN
Template.confirmButton.helpers({
  isUserOrderStatusUnconfirmed() {
    if (this && this.users) {
      const currentUser = this.users.find(x => x._id === Meteor.userId());
      return currentUser.orderStatus === UNCONFIRMED;
    }
  }
});

Template.confirmButton.events({
  "click #eventMenuConfirmBtn"(event) {
    const currentUser = this.users.find(x => x._id === Meteor.userId());
    const menu = currentUser.menu;

    const updatedMenu = menu.map(x => {
      const menuId = x._id;
      const amountValue = $(`#${menuId}`).val();
      return ({ ...x, amount: amountValue });
    });

    const eventId = getPathParams("_id");

    API.callMethod(CONFIRM_EVENT_MENU, [eventId, updatedMenu]);
  }
});

// SEND ORDER BTN
Template.sendOrderButton.helpers({
  isEventStatusOrdered() {
    // show 'send order' btn if event status === ORDERED and current user created this event
    return this.status === ORDERED && this.creatorId === Meteor.userId();
  }
});

Template.sendOrderButton.events({
  "click #eventMenuSendOrderBtn"(event) {
    const eventId = getPathParams("_id");
    API.callMethod(SEND_ORDER, [eventId]);
  }
});