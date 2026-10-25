import { ApiError } from "../utils/ApiError.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import Record from "../models/record.model.js";
import RecordAssignment from "../models/record-assignment.model.js";
import { escapeRegex } from "../utils/domain.js";

const validateGroup = async (groupId) => {
  if (!groupId) return;
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(400, "Group not found");
};

export const createPerson = async (data) => {
  const name = String(data.name || "").trim();
  if (!name) throw new ApiError(400, "name is required");
  await validateGroup(data.groupId);
  return Person.create({ ...data, name });
};

export const getPeople = async (filters = {}) => {
  const query = {};
  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), "i");
    query.$or = [{ name: regex }, { reference: regex }, { email: regex }];
  }
  if (filters.groupId) query.groupId = filters.groupId;
  if (typeof filters.isActive !== "undefined" && filters.isActive !== "") {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  return Person.find(query).populate("groupId").sort({ name: 1 });
};

export const getPersonById = async (id) => {
  const person = await Person.findById(id).populate("groupId");
  if (!person) throw new ApiError(404, "Person not found");
  return person;
};

export const updatePerson = async (id, data) => {
  await getPersonById(id);
  await validateGroup(data.groupId);
  const person = await Person.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("groupId");
  return person;
};

export const togglePersonStatus = async (id, isActive) => {
  const person = await Person.findByIdAndUpdate(
    id,
    { isActive: Boolean(isActive) },
    { new: true, runValidators: true },
  ).populate("groupId");
  if (!person) throw new ApiError(404, "Person not found");
  return person;
};

export const deletePerson = async (id) => {
  const person = await getPersonById(id);
  const [recordReference, assignmentHistoryReference] = await Promise.all([
    Record.exists({ personId: id }),
    RecordAssignment.exists({ personId: id }),
  ]);
  if (recordReference || assignmentHistoryReference) {
    throw new ApiError(409, "Cannot delete a person linked to one or more records or assignment histories");
  }
  await Person.findByIdAndDelete(id);
  return person;
};
