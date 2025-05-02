import { UserResponse, CreateRepo } from "@/types";
import { handleApiRequest } from "../client";

// member
export const fetchUser = async () => {
  return handleApiRequest<UserResponse, "get">("/api/v1/users", "get");
};

export const logOut = async () => {
  return handleApiRequest<void, "post">("/api/v1/logout", "post");
};

export const createRepo = async (data: CreateRepo) => {
  return handleApiRequest<CreateRepo, "post", CreateRepo>(
    "/api/v1/users/repo",
    "post",
    data
  );
};

export const existingRepo = async (data: CreateRepo) => {
  return handleApiRequest<CreateRepo, "put", CreateRepo>(
    "/api/v1/users/repo",
    "put",
    data
  );
};

export const deleteRepo = async () => {
  return handleApiRequest<void, "delete">("/api/v1/users/repo", "delete");
};
