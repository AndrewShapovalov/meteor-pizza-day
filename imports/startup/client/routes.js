// Import needed templates
import { Meteor } from "meteor/meteor";
import "../../ui/pages/index";
import "../../ui/components/index";
import "../../ui/layouts/body/body.js";
// collections
import { EventCollection } from "../../api/event/event-collection";
import UserGroupCollection from "../../api/groups/user-group-collection";
// const
import { RouteNames } from "../both/constants/index";

const {
  EVENT, GROUP, HOME, LOGIN,
} = RouteNames;

Router.route(HOME, {
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

Router.route(GROUP, {
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

Router.route(EVENT, {
  path: "/event/:_id",
  template: "event",
  loadingTemplate: "spinner",
  waitOn() {
    // return [Meteor.subscribe(GET_USER_LIST)];
  },
  data() {
    const { _id } = this.params;
    return EventCollection.findOne({ _id });
  },
});

Router.route(LOGIN, {
  path: "/login",
  template: "authPage",
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
  { except: ["authPage"] },
);

Router.configure({
  layoutTemplate: "root",
  notFoundTemplate: "notFound",
});
