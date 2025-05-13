import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateAccountDto } from './dto/createAccount.dto';
import { SignUpStrategyResolver } from './strategies/signup-strategy.resolver';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { OtpService } from './services/otp/otp.service';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';



@Controller('auth')
export class AuthController {
  constructor(
    readonly signupStratergyResolver: SignUpStrategyResolver,
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
  ) {
    console.log('✅ AuthController loaded');
  }
  @Post('signup')
  async signUp(@Body() body: CreateAccountDto) {
    const stratergy = this.signupStratergyResolver.resolve(body.role);

    const otpSuccess = await stratergy.signUp(body);

    return otpSuccess;
  }
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    console.log('body', body);
    return await this.otpService.verifyOtp(body);
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: ResendOtpDto) {
    console.log('body', body);
    return await this.otpService.resendOtp(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res({passthrough: true})res: Response)  {
    console.log('body', body);
    const { accessToken, user } = await this.authService.verifyLogin(body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'lax', 
      maxAge: 15 * 60 * 1000, 
    });
  
    return {
      message: 'Login successfully',
      data: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        isBlocked: user.isBlocked
      }
    }
  }

  @Post('forgot-password')
async forgotPassword(@Body() { email, role }: ForgotPasswordDto) {
  return this.authService.initiatePasswordReset(email, role);
}

@Post('reset-password')
async resetPassword(@Body() dto:ResetPasswordDto){

 const data =await this.authService.resetPassword(dto.token, dto.role, dto.newPassword);
 console.log('data', data);
 return data;
}

}



// async resetPassword(token: string, role: string, newPassword: string): Promise<void> {
//   const payload = this.jwtService.verifyPasswordResetToken(token);
//   const userId = payload.sub;

//   const hashedPassword = await this.hashService.hashPassword(newPassword);

//   if (role === 'trainer') {
//     await this.trainerService.updatePassword(userId, hashedPassword);
//   } else {
//     await this.userService.updatePassword(userId, hashedPassword);
//   }

//   // Optional: Invalidate token if stored in DB
// }
