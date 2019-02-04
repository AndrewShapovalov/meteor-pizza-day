import { CallServerMethodService } from "./call-server-method-service";
import { NotificationService } from "./notification-service";

const API = new CallServerMethodService();
const Notification = new NotificationService();

export { Notification, API };
