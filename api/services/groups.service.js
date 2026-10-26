import { ApiError } from "../utils/ApiError.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import Record from "../models/record.model.js";
import { escapeRegex, slugify } from "../utils/domain.js";

const buildGroupKey = (data) => slugify(data.key || data.name);

export const createGroup = async (data, workspaceOwnerId) => {
  const name = String(data.name || "").trim();
  if (!name) throw new ApiError(400, "name is required");
  return Group.create({ name, key: buildGroupKey(data), description: data.description, workspaceOwnerId });
};

export const getGroups = async (filters = {}, workspaceOwnerId) => {
  const query = { workspaceOwnerId };
  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), "i");
    query.$or = [{ name: regex }, { key: regex }];
  }
  if (typeof filters.isActive !== "undefined" && filters.isActive !== "") {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  return Group.find(query).sort({ name: 1 });
};

export const getGroupById = async (id, workspaceOwnerId) => {
  const group = await Group.findOne({ _id: id, workspaceOwnerId });
  if (!group) throw new ApiError(404, "Group not found");
  return group;
};

export const updateGroup = async (id, data, workspaceOwnerId) => {
  const current = await getGroupById(id, workspaceOwnerId);
  const name = data.name === undefined ? current.name : String(data.name).trim();
  if (!name) throw new ApiError(400, "name is required");
  return Group.findOneAndUpdate(
    { _id: id, workspaceOwnerId },
    { name, key: buildGroupKey({ ...current.toObject(), ...data, name }), description: data.description ?? current.description },
    { new: true, runValidators: true },
  );
};

export const toggleGroupStatus = async (id, isActive, workspaceOwnerId) => {
  const group = await Group.findOneAndUpdate(
    { _id: id, workspaceOwnerId },
    { isActive: Boolean(isActive) },
    { new: true, runValidators: true },
  );
  if (!group) throw new ApiError(404, "Group not found");
  return group;
};

export const deleteGroup = async (id, workspaceOwnerId) => {
  const group = await getGroupById(id, workspaceOwnerId);
  const [personReference, recordReference] = await Promise.all([
    Person.exists({ groupId: id, workspaceOwnerId }),
    Record.exists({ groupId: id, workspaceOwnerId }),
  ]);
  if (personReference || recordReference) {
    throw new ApiError(409, "Cannot delete a group that is in use");
  }
  await Group.deleteOne({ _id: id, workspaceOwnerId });
  return group;
};
