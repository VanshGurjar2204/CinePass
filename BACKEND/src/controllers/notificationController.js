import Notification from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    return sendSuccess(res, 200, "Notifications fetched", {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { returnDocument: "after" }
    );

    if (!notification) {
      return sendError(res, 404, "Notification not found");
    }

    return sendSuccess(res, 200, "Notification marked as read", notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    return sendSuccess(res, 200, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Notification.findOneAndDelete({ _id: id, user: userId });
    return sendSuccess(res, 200, "Notification removed");
  } catch (error) {
    next(error);
  }
};

