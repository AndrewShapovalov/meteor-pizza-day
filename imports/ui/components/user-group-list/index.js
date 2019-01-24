import "./index.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
// services
import { API } from "client/services";
// own helpers
import { getPathParams } from "helpers";
// const
import { MethodNames } from "constants/index";
import { PubAndSubNames } from "../../../../constants/index";
import UserGroupCollection from "../../../api/user-group/user-group-collection";

const { GET_CURRENT_USER_GROUPS } = PubAndSubNames;
const { CREATE_USER_GROUP } = MethodNames;

Template.userGroupList.onCreated(() => {
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
const togglePreviewImgItem = () => {
  const item = $(".preview_img_item_hidden")[0];
  if (item) {
    $(".preview_img_item").removeClass("preview_img_item_hidden");
  } else {
    $(".preview_img_item").addClass("preview_img_item_hidden");
  }
};

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
      $(".preview_img_item").attr("src", base64);
      togglePreviewImgItem();
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
        throw new Meteor.Error(err);
      }
      togglePreviewImgItem();
      $(".form_name_input").val("");
      $("#formFileInput").val("");
      toggleAddGroupForm();
    };
    API.callMethod(CREATE_USER_GROUP, [dataForSend], createdGroupCallback);
  },
});

Template.userGroupTitle.events({
  "click .add_group_button": toggleAddGroupForm,
});

// HELPERS
Template.userGroupList.helpers({
  userGroupCollection: () => UserGroupCollection.find(),
});

Template.userGroupListItem.helpers({
  isGroupSelected() {
    return getPathParams("_id") === this._id;
  },
});