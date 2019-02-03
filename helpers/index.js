import UserGroupCollection from "imports/api/groups/user-group-collection";
// const
import { EventStatuses, UserOrderStatuses } from "constants";

const { ORDERING, ORDERED, DELIVERING } = EventStatuses;
const { UNCONFIRMED } = UserOrderStatuses;

const getPathParams = param => Router.current().params[param];

const getGroupOwnerId = (groupId) => {
  const group = UserGroupCollection.findOne({ _id: groupId });
  return group && group.ownerId;
};

const getUserOrderStatus = (userOrderStatus) => {
  switch (userOrderStatus) {
  case UNCONFIRMED: {
    return "Unconfirmed";
  }
  default: {
    return "Confirmed";
  }
  }
};

const getEventStatus = (status) => {
  switch (status) {
  case ORDERING: {
    return "Ordering";
  }
  case ORDERED: {
    return "Ordered";
  }
  case DELIVERING: {
    return "Delivering";
  }
  default: {
    return "Delivered";
  }
  }
};

const getFriendlyDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleString("en-US", options);
};

export {
  getPathParams, getFriendlyDate, getGroupOwnerId, getEventStatus, getUserOrderStatus,
};
