/* eslint no-undef: 0 */

// modules
import { ErrorReasons } from "constants";

const { GROUP_NAME_IS_ALREADY_EXISTS } = ErrorReasons;

export class NotificationService {
  reason;

  getMessageByReason(reason) {
    this.reason = reason;
    switch (this.reason) {
    case GROUP_NAME_IS_ALREADY_EXISTS: {
      return "Name has already exists!";
    }
    default: {
      return "";
    }
    }
  }

  success = (reason, message) => {
    const msg = this.getMessageByReason(reason) || message;
    toastr.success(msg, "SUCCESS");
  };

  error = (reason, message) => {
    const msg = this.getMessageByReason(reason) || message;
    toastr.error(msg, "ERROR");
  };

  warning = (reason, message) => {
    const msg = this.getMessageByReason(reason) || message;
    toastr.warning(msg, "WARNING");
  };
}
