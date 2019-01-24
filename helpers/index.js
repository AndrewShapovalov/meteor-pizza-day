import UserGroupCollection from "imports/api/user-group/user-group-collection";

const getPathParams = param => Router.current().params[param];

const getGroupOwnerId = (groupId) => {
  const group = UserGroupCollection.findOne({ _id: groupId });
  return group && group.ownerId;
};


export { getPathParams, getGroupOwnerId };
