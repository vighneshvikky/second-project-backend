import { Body, Controller, Post } from '@nestjs/common';
import { CreateAccountDto } from './dto/createAccount.dto';
import { SignUpStrategyResolver } from './strategies/signup-strategy.resolver';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { OtpService } from './services/otp/otp.service';

@Controller('auth')
export class AuthController {
  constructor(
    readonly signupStratergyResolver: SignUpStrategyResolver,
    private readonly otpService: OtpService,
  ) {}
  @Post('signup')
  async signUp(@Body() body: CreateAccountDto) {
    const stratergy = this.signupStratergyResolver.resolve(body.role);

    const otpSuccess = await stratergy.signUp(body);

    return otpSuccess;
  }
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    console.log('body', body)
    return await this.otpService.verifyOtp(body);
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: ResendOtpDto) {
    return await this.otpService.resendOtp(body);
  }
}
