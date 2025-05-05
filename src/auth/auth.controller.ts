import { Body, Controller, Post } from '@nestjs/common';
import { CreateAccountDto } from './dto/createAccount.dto';
import { SignUpStrategyResolver } from './strategies/signup-strategy.resolver';

@Controller('auth')
export class AuthController {
  constructor(readonly signupStratergyResolver: SignUpStrategyResolver){}
  @Post('signup')
  async signUp(@Body() body: CreateAccountDto) {
    console.log('body', body);
    const stratergy = this.signupStratergyResolver.resolve(body.role);
    return stratergy.signUp(body)
  }
}
