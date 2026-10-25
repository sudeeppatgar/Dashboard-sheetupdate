import { isMongoId, isNonEmptyString, trimValue } from "../utils/validators.js";

const idValidator = (label) => ({
  id: {
    required: true,
    type: "string",
    transform: trimValue,
    validate: (value) => (isMongoId(value) ? true : `Invalid ${label} id`),
  },
});

export const recordTypeIdValidator = idValidator("record type");
export const recordIdValidator = idValidator("record");
export const groupIdValidator = idValidator("group");
export const personIdValidator = idValidator("person");

export const createRecordTypeValidator = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) => (isNonEmptyString(value) ? true : "name is required"),
  },
};

export const updateRecordTypeValidator = {
  name: {
    required: false,
    type: "string",
    minLength: 2,
    transform: trimValue,
  },
};

export const createGroupValidator = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) => (isNonEmptyString(value) ? true : "name is required"),
  },
};

export const updateGroupValidator = {
  name: { required: false, type: "string", minLength: 2, transform: trimValue },
};

export const createPersonValidator = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) => (isNonEmptyString(value) ? true : "name is required"),
  },
};

export const updatePersonValidator = {
  name: { required: false, type: "string", minLength: 2, transform: trimValue },
};
