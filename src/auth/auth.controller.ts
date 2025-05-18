import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/createAccount.dto';
import { SignUpStrategyResolver } from './strategies/signup-strategy.resolver';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { OtpService } from './services/otp/otp.service';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtTokenService } from './services/jwt/jwt.service';

@Controller('auth')
export class AuthController {
  constructor(
    readonly signupStratergyResolver: SignUpStrategyResolver,
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtTokenService,
  ) {
    console.log('✅ AuthController loaded');
  }
  @Post('signup')
  async signUp(@Body() body: any) {
    console.log('body', body);
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
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('user body', body);
    const { accessToken, refreshToken, user } =
      await this.authService.verifyLogin(body);
console.log('access_token',accessToken);
console.log('refresh')
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return {
      message: 'Login successfully',
      data: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email, role }: ForgotPasswordDto) {
    return this.authService.initiatePasswordReset(email, role);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const data = await this.authService.resetPassword(
      dto.token,
      dto.role,
      dto.newPassword,
    );
    console.log('data', data);
    return data;
  }

  @Post('refresh/token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

  
    const payload = this.jwtService.decodeToken(refreshToken);

    if (!payload?.sub || !payload?.role) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    const { accessToken, newRefreshToken } =
      await this.authService.rotateRefreshToken(refreshToken, payload.role);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.send({
      message: 'Tokens refreshed',
      role: payload.role,
    });
  }
}
