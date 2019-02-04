import "./body.html";
import "../header/index";
import "../side-bar/index";
import "../content/index";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";

Template.root.helpers({
  addOrRemoveAppBackground() {
    if (Meteor.userId()) {
      $("body").removeClass("app_background");
    } else {
      $("body").addClass("app_background");
    }
  },
});
