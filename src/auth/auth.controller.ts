import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export default class AuthController {
  //Inject auth service
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() user: AuthDto) {
    return this.authService.login(user);
  }

  @Post('signup')
  signup(@Body() user: AuthDto) {
    return this.authService.signup(user);
  }
}
