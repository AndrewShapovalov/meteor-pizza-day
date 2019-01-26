import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

export class CallServerMethodService {
  callMethod = (methodName, args, cb = () => null) => {
    check(methodName, String);
    check(args, Array);
    check(cb, Function);
    try {
      Meteor.apply(methodName, args, cb);
    } catch (err) {
      throw new Meteor.Error(err);
    }
  };
}
