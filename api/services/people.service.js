import { ApiError } from "../utils/ApiError.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import Record from "../models/record.model.js";
import RecordAssignment from "../models/record-assignment.model.js";
import User from "../models/user.model.js";
import { escapeRegex } from "../utils/domain.js";

const validateGroup = async (groupId) => {
  if (!groupId) return;
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(400, "Group not found");
};

const duplicateEmailError = (error) => {
  if (error?.code === 11000 && (error.keyPattern?.email || error.keyValue?.email)) {
    return new ApiError(409, "That email address is already used by another login account");
  }
  return error;
};

const requireLoginDetails = (email, password) => {
  if (!email) throw new ApiError(400, "Email is required when login access is enabled");
  if (!password || String(password).length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters when login access is enabled");
  }
};

export const createPerson = async (data) => {
  const name = String(data.name || "").trim();
  if (!name) throw new ApiError(400, "name is required");
  await validateGroup(data.groupId);

  const { password, loginEnabled, ...personData } = data;
  let user;

  try {
    if (loginEnabled === true) {
      const email = String(personData.email || "").trim().toLowerCase();
      requireLoginDetails(email, password);
      user = await User.create({ name, email, password, role: "user" });
      personData.email = email;
    }

    return await Person.create({
      ...personData,
      name,
      userId: user?._id,
      loginEnabled: Boolean(user),
    });
  } catch (error) {
    if (user?._id) await User.findByIdAndDelete(user._id);
    throw duplicateEmailError(error);
  }
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
  const current = await getPersonById(id);
  await validateGroup(data.groupId);

  const { password, loginEnabled, ...personData } = data;
  const nextLoginEnabled = loginEnabled === undefined ? Boolean(current.loginEnabled) : Boolean(loginEnabled);
  let user = current.userId ? await User.findById(current.userId) : null;

  try {
    if (nextLoginEnabled) {
      const email = String(personData.email || current.email || "").trim().toLowerCase();
      if (email) {
        const duplicatePerson = await Person.exists({ email, _id: { $ne: id } });
        if (duplicatePerson) throw new ApiError(409, "That email address is already used by another person");
      }
      if (!user) {
        requireLoginDetails(email, password);
        user = await User.create({ name: personData.name || current.name, email, password, role: "user", isActive: current.isActive });
      } else {
        if (!email) throw new ApiError(400, "Email is required when login access is enabled");
        user.name = String(personData.name || current.name).trim();
        user.email = email;
        user.isActive = current.isActive;
        if (password) {
          if (String(password).length < 8) throw new ApiError(400, "Password must be at least 8 characters");
          user.password = password;
        }
        await user.save();
      }
      personData.email = email;
    } else if (user) {
      user.isActive = false;
      await user.save();
    }

    return await Person.findByIdAndUpdate(
      id,
      { ...personData, userId: user?._id, loginEnabled: nextLoginEnabled },
      { new: true, runValidators: true },
    ).populate("groupId");
  } catch (error) {
    throw duplicateEmailError(error);
  }
};

export const togglePersonStatus = async (id, isActive) => {
  const person = await Person.findByIdAndUpdate(
    id,
    { isActive: Boolean(isActive) },
    { new: true, runValidators: true },
  ).populate("groupId");
  if (!person) throw new ApiError(404, "Person not found");
  if (person.userId) await User.findByIdAndUpdate(person.userId, { isActive: Boolean(isActive) });
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
  if (person.userId) await User.findByIdAndDelete(person.userId);
  return person;
};
