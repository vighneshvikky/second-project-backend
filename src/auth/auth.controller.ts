import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
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
import { GoogleLoginDto } from './dto/google-login.dto';
import { setTokenCookies } from 'src/common/helpers/token.setter';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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
 

     setTokenCookies(res, accessToken, refreshToken)
    return {
      message: 'Login successfully',
      data: {
        user,
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
    console.log('redirected to refresh token....');
    const refreshToken = req.cookies['refresh_token'];
    console.log('refreshToken', refreshToken)
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const payload = this.jwtService.decodeToken(refreshToken);
    console.log('payload', payload);
    if (!payload?.sub || !payload?.role) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    const { accessToken, newRefreshToken } =
      await this.authService.rotateRefreshToken(refreshToken, payload.role);

    setTokenCookies(res, accessToken, newRefreshToken);
    
    return res.send({
      message: 'Tokens refreshed',
      role: payload.role,
    });
  }

  @Get('google/redirect')
  redirectGoogle(@Query('role') role: string, @Res() res: Response) {
    console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI);

    const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    redirectUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
    redirectUrl.searchParams.set(
      'redirect_uri',
      process.env.GOOGLE_REDIRECT_URI!,
    );
    redirectUrl.searchParams.set('response_type', 'code');
    redirectUrl.searchParams.set('scope', 'openid email profile');
    redirectUrl.searchParams.set('state', role);

    return res.redirect(redirectUrl.toString());
  }

  @Get('google/callback')
  async handleGoogleCallback(
    @Query('code') code: string,
    @Query('state') role: string,
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.googleLogin(code, role);

    setTokenCookies(res, accessToken, refreshToken);

    const redirectUrl = new URL('http://localhost:4200/auth/callback');
    redirectUrl.searchParams.set('email', user.email);
    redirectUrl.searchParams.set('name', user.name);
    redirectUrl.searchParams.set('role', user.role);
    redirectUrl.searchParams.set('isVerified', String(user.isVerified));

    return res.redirect(
      `http://localhost:4200/auth/callback?user=${encodeURIComponent(JSON.stringify(user))}`,
    );
  }



  @Get('getUser')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: any) { 
    const user = await this.authService.getUser(req.user.sub);
    return user;
  }


}
