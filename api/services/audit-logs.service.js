import AuditLog from "../models/audit-log.model.js";

export const createAuditLog = (data) => AuditLog.create(data);

export const getAuditLogs = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 25));
  const skip = (page - 1) * limit;
  const [items, totalItems] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(),
  ]);
  return { items, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1, hasNextPage: page * limit < totalItems, hasPreviousPage: page > 1 } };
};
