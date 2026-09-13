export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";
export type ProjectRole = "owner" | "editor" | "viewer";

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  role: ProjectRole;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
