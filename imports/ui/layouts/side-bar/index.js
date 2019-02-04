import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
// import {} from "meteor/chrismbeckett:toastr";
// own
import "./index.html";
// services
import { API, Notification } from "client/services";
// own helpers
import { getPathParams } from "helpers";
// const
import { MethodNames } from "constants/index";
import { PubAndSubNames } from "../../../../constants/index";
// collections
import UserGroupCollection from "../../../api/groups/user-group-collection";

const { GET_CURRENT_USER_GROUPS } = PubAndSubNames;
const { CREATE_GROUP, REMOVE_GROUP } = MethodNames;

const { error, success } = Notification;

Template.sideBar.onCreated(() => {
  try {
    Meteor.subscribe(GET_CURRENT_USER_GROUPS);
  } catch (err) {
    throw new Meteor.Error(err);
  }
});

const toggleAddGroupForm = () => {
  const item = $(".add_group_form_hidden")[0];
  if (item) {
    $("#userGroupAddForm").removeClass("add_group_form_hidden");
  } else {
    $("#userGroupAddForm").addClass("add_group_form_hidden");
  }
};
/* const togglePreviewImgItem = () => {
  const item = $(".preview_img_item_hidden")[0];
  if (item) {
    $(".preview_img_item").removeClass("preview_img_item_hidden");
  } else {
    $(".preview_img_item").addClass("preview_img_item_hidden");
  }
}; */

// EVENTS
Template.userGroupAddForm.events({
  "click .form_close_btn": toggleAddGroupForm,
  "click .form_select_logo_btn"(event) {
    event.preventDefault();
    $("#formFileInput").trigger("click");
  },
  "change #formFileInput"(event) {
    const file = event.currentTarget.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function ({ target }) {
      const res = target.result;
      const base64 = `data:${file.type};base64,${btoa(res)}`;
      const previewImgItem = $(".preview_img_item");
      previewImgItem.attr("src", base64);
      previewImgItem.removeClass("preview_img_item_hidden");
    };
    reader.readAsBinaryString(file);
  },
  "submit #userGroupAddForm"(event, templateInstance) {
    event.preventDefault();

    const formErrorTextItem = $(".form_error_text");

    const formNameValue = templateInstance.find(".form_name_input").value;
    if (!formNameValue) {
      formErrorTextItem.text("Group name's required!");
      formErrorTextItem.removeClass("form_error_text_hidden");
      return;
    }

    const imgFilePath = templateInstance.find("#formFileInput").value;
    if (!imgFilePath) {
      formErrorTextItem.text("Group logo's required!");
      formErrorTextItem.removeClass("form_error_text_hidden");
      return;
    }

    formErrorTextItem.addClass("form_error_text_hidden");

    const groupName = templateInstance.find(".form_name_input").value;
    const imgBase64 = $(".preview_img_item").attr("src");
    const dataForSend = { name: groupName, logo: imgBase64 };

    const createdGroupCallback = (err) => {
      if (err) {
        const { reason } = err;
        if (reason) {
          error(reason);
          return;
        }
        throw new Meteor.Error(err);
      }
      success(null, "Group created!");
      $(".preview_img_item").addClass("preview_img_item_hidden");
      $(".form_name_input").val("");
      $("#formFileInput").val("");
      toggleAddGroupForm();
    };
    API.callMethod(CREATE_GROUP, [dataForSend], createdGroupCallback);
  },
});

Template.userGroupTitle.events({
  "click .add_group_button": toggleAddGroupForm,
});

// HELPERS
Template.sideBar.helpers({
  userGroupCollection: () => UserGroupCollection.find({}, { sort: { createdAt: -1 } }),
});

Template.userGroupListItem.helpers({
  "click .group_list_item_link"() {
    Router.go(`/group/${this._id}`);
  },
  isGroupSelected() {
    return getPathParams("_id") === this._id;
  },
  isOwnerGroup() {
    return this.ownerId === Meteor.userId();
  },
});

Template.userGroupListItem.events({
  "click .group_list_item"() {
    Router.go(`/group/${this._id}`);
  },
  "click .remove_group_btn_container"() {
    const groupId = getPathParams("_id");
    API.callMethod(REMOVE_GROUP, [groupId], (err) => {
      if (err) {
        return;
      }
      Router.go("/");
      success(null, "Group removed!");
    });
  },
});
