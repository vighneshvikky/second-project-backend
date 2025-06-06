export const IAdminService = Symbol('IAdminService');

export interface IAdminService {
  verifyAdminLogin(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;

  getUsers

  toggleBlockStatus


  getUnverifiedTrainers

  approveTrainer


  rejectTrainer
}
