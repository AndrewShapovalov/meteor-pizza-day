// Import needed templates
import { Meteor } from "meteor/meteor";
import "imports/ui/pages/index";
import "imports/ui/components/index";
import "../../ui/layouts/body/body.js";
import UserGroupCollection from "imports/api/user-group/user-group-collection";
// import { PubAndSubNames } from "constants/index";
// Set up all routes in the app

// const { GET_USER_LIST, GET_CURRENT_USER_GROUPS, } = PubAndSubNames;

Router.route("HOME", {
  path: "/",
  template: "home",
  loadingTemplate: "spinner",
  waitOn() {
    // return [Meteor.subscribe(GET_CURRENT_USER_GROUPS)];
  },
  data() {
    const item = UserGroupCollection.findOne({});
    if (item) {
      this.redirect(`/group/${item._id}`);
    }
  },
});

Router.route("GROUP", {
  path: "/group/:_id",
  template: "group",
  loadingTemplate: "spinner",
  waitOn() {
    // return [Meteor.subscribe(GET_USER_LIST)];
  },
  data() {
    const { _id } = this.params;
    return UserGroupCollection.findOne({ _id });
  },
});

Router.route("LOGIN", {
  path: "/login",
  template: "auth-page",
});

Router.onBeforeAction(
  function() {
    if (!Meteor.userId()) {
      this.redirect("/login");
    }
    if (Meteor.userId() && this.url === "/login") {
      this.redirect("/");
    }
    this.render();
  },
  { except: ["auth-page"] },
);

Router.configure({
  layoutTemplate: "root",
  notFoundTemplate: "notFound",
});
