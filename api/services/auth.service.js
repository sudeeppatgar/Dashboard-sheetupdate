import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/generateToken.js";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import { slugify } from "../utils/domain.js";

const defaultWorkspaceConfig = {
  appTagline: "Manage the records and resources that matter to your organization.",
  recordSingular: "Record",
  recordPlural: "Records",
  categorySingular: "Category",
  categoryPlural: "Categories",
  typeSingular: "Record type",
  typePlural: "Record types",
  groupSingular: "Group",
  groupPlural: "Groups",
  personSingular: "Person",
  personPlural: "People",
  identifierLabel: "Reference",
  acquisitionDateLabel: "Acquisition date",
  statusLabels: {
    active: "Active",
    "in-progress": "In progress",
    completed: "Completed",
    archived: "Archived",
  },
};

const getWorkspaceForUser = async (user) => {
  if (user.workspaceId) return Workspace.findById(user.workspaceId);
  if (user.workspaceOwnerId) return Workspace.findOne({ ownerId: user.workspaceOwnerId });
  if (user.role === "admin") return Workspace.findOne({ ownerId: user._id });
  return null;
};

const serializeWorkspace = (workspace) => {
  if (!workspace) return null;
  return workspace.toObject({ flattenMaps: true });
};

const serializeAuthData = async (user) => {
  const workspace = await getWorkspaceForUser(user);
  const userData = user.toObject();
  delete userData.password;
  return { user: userData, workspace: serializeWorkspace(workspace) };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isActive === false) {
    throw new ApiError(403, "Your account is inactive. Contact an administrator");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user._id);
  return { ...(await serializeAuthData(user)), token };
};

export const registerAdmin = async ({ workspaceName, name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedWorkspaceName = String(workspaceName || "").trim();
  const slug = slugify(normalizedWorkspaceName);

  if (!slug) throw new ApiError(400, "Workspace name is required");
  if (await User.exists({ email: normalizedEmail })) {
    throw new ApiError(409, "An account with that email already exists");
  }
  if (await Workspace.exists({ slug })) {
    throw new ApiError(409, "That workspace name is already registered");
  }

  const admin = new User({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role: "admin",
  });
  admin.workspaceOwnerId = admin._id;
  let workspace;

  try {
    await admin.save();
    workspace = await Workspace.create({
      name: normalizedWorkspaceName,
      slug,
      ownerId: admin._id,
      config: {
        ...defaultWorkspaceConfig,
        appName: normalizedWorkspaceName,
      },
    });
    admin.workspaceId = workspace._id;
    await admin.save();
    const token = generateToken(admin._id);
    return { ...(await serializeAuthData(admin)), token };
  } catch (error) {
    if (workspace?._id) await Workspace.findByIdAndDelete(workspace._id);
    await User.findByIdAndDelete(admin._id);
    if (error?.code === 11000) {
      throw new ApiError(409, "That workspace or email is already registered");
    }
    throw error;
  }
};

export const authenticateRequest = async ({ token, model, jwtSecret }) => {
  if (!token) {
    throw new ApiError(401, "Unauthorized access. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await model.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, "Invalid token. User not found");
    }

    if (user.isActive === false) {
      throw new ApiError(403, "Your account is inactive. Contact support");
    }

    if (user.passwordChangedAt) {
      const passwordChangedAt = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10,
      );

      if (passwordChangedAt > decoded.iat) {
        throw new ApiError(
          401,
          "Password changed recently. Please log in again.",
        );
      }
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, "Invalid or expired token.");
  }
};
