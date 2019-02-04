/* eslint no-restricted-globals: 0 */
import "./index.html";
import "../../components/index";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
// services
import { API, Notification } from "client/services";
// own helpers
import { getPathParams, getGroupOwnerId } from "helpers/index";
// const
import { PubAndSubNames, MethodNames } from "constants/index";
// collections
import UserGroupCollection from "imports/api/groups/user-group-collection";

const { success } = Notification;
const { GET_MENU_LIST, GET_USER_LIST } = PubAndSubNames;
const {
  CREATE_EVENT,
  REMOVE_USER_FROM_GROUP,
  REMOVE_MENU_FROM_GROUP,
  ADD_USER_TO_GROUP,
  CREATE_MENU_ITEM,
  UPDATE_MENU_ITEM,
} = MethodNames;

// own helpers
const cancelCreationMenuItem = () => {
  $("#createRow").addClass("hidden");
  $("#addNewRowBtn").removeClass("disabled");
  const rowChildren = $("#createRow").children();
  rowChildren[0].querySelector("input").value = "";
  rowChildren[1].querySelector("input").value = "";
};

const cancelCreationEvent = () => {
  $(".create_event_input_container").addClass("hidden");
  $(".create_event_input").val("");
};

// end own helpers

// GROUP
Template.group.onCreated(() => {
  try {
    Meteor.subscribe(GET_USER_LIST);
    Meteor.subscribe(GET_MENU_LIST);
  } catch (err) {
    throw new Meteor.Error(err);
  }
});

// GROUP USER LIST
Template.groupUserList.helpers({
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
    return currentUserId === ownerId && currentUserId !== this._id;
  },
  userCollection: () => {
    const userList = Meteor.users.find().fetch();
    const selectedGroup = UserGroupCollection.findOne({ _id: Router.current().params._id });
    const preparedUserList = userList.map(a => ({ _id: a._id, name: a.profile.name }));
    const usersOfCurrentGroup = selectedGroup && selectedGroup.users;
    return preparedUserList.filter(
      b => usersOfCurrentGroup && usersOfCurrentGroup.every(c => c._id !== b._id),
    );
  },
});

Template.groupUserList.events({
  "click #removeUserFromGroupBtn"(event) {
    event.preventDefault();
    const groupId = getPathParams("_id");
    const user = this;
    API.callMethod(REMOVE_USER_FROM_GROUP, [groupId, user], (err) => {
      if (err) {
        return;
      }
      success(null, "User removed!");
    });
  },
  "click #dropdownItemLink"(event) {
    event.preventDefault();
    const groupId = getPathParams("_id");
    const user = this;
    API.callMethod(ADD_USER_TO_GROUP, [groupId, user], (err) => {
      if (err) {
        return;
      }
      success(null, "User added!");
    });
  },
});

// HEADER OF GROUP
Template.groupHeader.events({
  "click #showEventInputBtn": () => $(".create_event_input_container").removeClass("hidden"),
  "click #cancelEventInputBtn": cancelCreationEvent,
  "change .create_event_input"(event) {
    const isErrorClass = event.currentTarget
      .getAttribute("class")
      .includes("create_event_input_error");
    if (isErrorClass) {
      event.currentTarget.classList.remove("create_event_input_error");
    }
  },
  "submit #createEventForm"(event) {
    event.preventDefault();
    const eventInputEl = $(".create_event_input");
    const eventInputValue = eventInputEl[0].value;
    if (!eventInputValue) {
      eventInputEl.addClass("create_event_input_error");
      return;
    }
    const name = $(".create_event_input").val(); // event name
    const groupId = getPathParams("_id");
    API.callMethod(CREATE_EVENT, [groupId, name], (err) => {
      if (err) {
        return;
      }
      success(null, "Event created!");
      cancelCreationEvent();
    });
  },
});

// MENU TABLE
Template.groupMenuTable.events({
  "change input"(event) {
    const isErrorClass = event.currentTarget.getAttribute("class").includes("input_required");
    if (isErrorClass) {
      event.currentTarget.classList.remove("input_required");
    }
  },
  "click #cancelNewRowBtn": cancelCreationMenuItem,
  "click #addNewRowBtn"(event) {
    const isDisabled = event.currentTarget.getAttribute("class").includes("disabled");
    if (isDisabled) {
      return;
    }
    $("#addNewRowBtn").addClass("disabled");
    $("#createRow").removeClass("hidden");
  },
  "click #createBtn"() {
    const groupId = getPathParams("_id");
    const rowChildren = $("#createRow").children();
    const nameInput = rowChildren[0].querySelector("input");
    const priceInput = rowChildren[1].querySelector("input");
    if (!nameInput.value) {
      nameInput.classList.add("input_required");
      return;
    }
    if (!priceInput.value || isNaN(Number(priceInput.value))) {
      priceInput.classList.add("input_required");
      return;
    }
    const newMenuItem = {
      name: rowChildren[0].querySelector("input").value,
      price: rowChildren[1].querySelector("input").value,
    };

    API.callMethod(CREATE_MENU_ITEM, [groupId, newMenuItem], (err) => {
      if (err) {
        return;
      }
      success(null, "Created!");
    });
    cancelCreationMenuItem();
  },
});

// MENU TABLE ROW
Template.menuTableRow.events({
  "click #cancelBtn"() {
    const rowId = this._id;
    $(`#${rowId}`)
      .children()
      .each(function(index) {
        if (index === 2) {
          this.querySelector("#saveBtn").classList.add("btn-hidden");
          this.querySelector("#cancelBtn").classList.add("btn-hidden");
          this.querySelector("#editBtn").classList.remove("btn-hidden");
          this.querySelector("#removeBtn").classList.remove("btn-hidden");
          document.querySelectorAll("#editBtn").forEach(x => x.classList.remove("disabled"));
          return;
        }
        const input = this.querySelector("input");
        const span = this.querySelector("span");
        input.classList.add("hidden");
        input.value = span.innerText;
        span.classList.remove("hidden");
      });
  },
  "click #editBtn"(event) {
    const rowId = this._id;
    const isDisabled = event.currentTarget.getAttribute("class").includes("disabled");

    if (isDisabled) {
      return;
    }

    $(`#${rowId}`)
      .children()
      .each(function(index) {
        if (index === 2) {
          this.querySelector("#editBtn").classList.add("btn-hidden");
          this.querySelector("#removeBtn").classList.add("btn-hidden");
          this.querySelector("#saveBtn").classList.remove("btn-hidden");
          this.querySelector("#cancelBtn").classList.remove("btn-hidden");
          document.querySelectorAll("#editBtn").forEach(x => x.classList.add("disabled"));
          return;
        }
        this.querySelector("span").classList.add("hidden");
        this.querySelector("input").classList.remove("hidden");
      });
  },
  "click #removeBtn"() {
    const groupId = getPathParams("_id");
    const menuItem = this;
    API.callMethod(REMOVE_MENU_FROM_GROUP, [groupId, menuItem], (err) => {
      if (err) {
        return;
      }
      success(null, "Removed!");
    });
  },
  "click #saveBtn"() {
    const rowId = this._id;
    const groupId = getPathParams("_id");
    const rowChildren = $(`#${rowId}`).children();
    const updatedMenuItem = {
      _id: rowId,
      name: rowChildren[0].querySelector("input").value,
      price: rowChildren[1].querySelector("input").value,
    };

    API.callMethod(UPDATE_MENU_ITEM, [groupId, updatedMenuItem], (err) => {
      if (err) {
        return;
      }
      success(null, "Updated!");
    });

    rowChildren.each(function(index) {
      if (index === 2) {
        this.querySelector("#saveBtn").classList.add("btn-hidden");
        this.querySelector("#cancelBtn").classList.add("btn-hidden");
        this.querySelector("#editBtn").classList.remove("btn-hidden");
        this.querySelector("#removeBtn").classList.remove("btn-hidden");
        document.querySelectorAll("#editBtn").forEach(x => x.classList.remove("disabled"));
        return;
      }
      this.querySelector("input").classList.add("hidden");
      this.querySelector("span").classList.remove("hidden");
    });
  },
});
