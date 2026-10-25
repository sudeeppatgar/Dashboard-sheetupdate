import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createPerson as createPersonRecord,
  getPeople as getPersonRecords,
  getPersonById,
  updatePerson as updatePersonRecord,
  togglePersonStatus as togglePersonRecordStatus,
  deletePerson as deletePersonRecord,
} from "../services/people.service.js";

export const createPerson = asyncHandler(async (req, res) => {
  const person = await createPersonRecord(req.body);
  res.status(201).json(new ApiResponse(201, person, "Person created"));
});

export const getPeople = asyncHandler(async (req, res) => {
  const people = await getPersonRecords(req.query);
  res.json(new ApiResponse(200, people, "People fetched"));
});

export const getPerson = asyncHandler(async (req, res) => {
  const person = await getPersonById(req.params.id);
  res.json(new ApiResponse(200, person, "Person fetched"));
});

export const updatePerson = asyncHandler(async (req, res) => {
  const person = await updatePersonRecord(req.params.id, req.body);
  res.json(new ApiResponse(200, person, "Person updated"));
});

export const togglePersonStatus = asyncHandler(async (req, res) => {
  const person = await togglePersonRecordStatus(req.params.id, req.body.isActive);
  res.json(new ApiResponse(200, person, "Person status updated"));
});

export const deletePerson = asyncHandler(async (req, res) => {
  await deletePersonRecord(req.params.id);
  res.json(new ApiResponse(200, null, "Person deleted"));
});
