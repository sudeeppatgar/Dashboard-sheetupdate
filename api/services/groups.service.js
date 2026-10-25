import { ApiError } from "../utils/ApiError.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import Record from "../models/record.model.js";
import { escapeRegex, slugify } from "../utils/domain.js";

const buildGroupKey = (data) => slugify(data.key || data.name);

export const createGroup = async (data) => {
  const name = String(data.name || "").trim();
  if (!name) throw new ApiError(400, "name is required");
  return Group.create({ ...data, name, key: buildGroupKey(data) });
};

export const getGroups = async (filters = {}) => {
  const query = {};
  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), "i");
    query.$or = [{ name: regex }, { key: regex }];
  }
  if (typeof filters.isActive !== "undefined" && filters.isActive !== "") {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  return Group.find(query).sort({ name: 1 });
};

export const getGroupById = async (id) => {
  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, "Group not found");
  return group;
};

export const updateGroup = async (id, data) => {
  const current = await getGroupById(id);
  const name = data.name === undefined ? current.name : String(data.name).trim();
  if (!name) throw new ApiError(400, "name is required");
  return Group.findByIdAndUpdate(
    id,
    { ...data, name, key: buildGroupKey({ ...current.toObject(), ...data, name }) },
    { new: true, runValidators: true },
  );
};

export const toggleGroupStatus = async (id, isActive) => {
  const group = await Group.findByIdAndUpdate(
    id,
    { isActive: Boolean(isActive) },
    { new: true, runValidators: true },
  );
  if (!group) throw new ApiError(404, "Group not found");
  return group;
};

export const deleteGroup = async (id) => {
  const group = await getGroupById(id);
  const [personReference, recordReference] = await Promise.all([
    Person.exists({ groupId: id }),
    Record.exists({ groupId: id }),
  ]);
  if (personReference || recordReference) {
    throw new ApiError(409, "Cannot delete a group that is in use");
  }
  await Group.findByIdAndDelete(id);
  return group;
};
