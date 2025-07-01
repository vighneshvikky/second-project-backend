import { IUserRoleService } from "src/common/interface/user-role-service.interface";

export const AUTH_SERVICE_REGISTRY = 'AUTH_SERVICE_REGISTRY'

export interface IAuthServiceRegistry {
  getServiceByRole(role: string): IUserRoleService;
}