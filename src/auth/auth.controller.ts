import {
  Controller,
  Post,
  Get,
  Body,
  Version,
  UsePipes,
  Res,
  Param,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, signUpSchema } from './dto/sign-up.dto';
//import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthValidationPipe } from './pipes/validation.pipe';
import { SignInDto, signInSchema } from './dto/sign-in.dto';
import { FastifyReply } from 'fastify';
import { AuthResponseDto } from './dto/auth-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @Version('1')
  @UsePipes(new AuthValidationPipe(signUpSchema)) // Request body Validation
  async signUp(@Body() body: SignUpDto): Promise<AuthResponseDto> {
    //Get response from service
    const response = await this.authService.signUp(body);

    /**  Maps response dto to response from the service, thereby excluding fields from dto **/
    return plainToInstance(AuthResponseDto, response);
  }

  @Post('sign-in')
  @Version('1')
  @UsePipes(new AuthValidationPipe(signInSchema)) // Request body Validation
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthResponseDto> {
    //Get Response from service
    const response = await this.authService.signIn(body, res);

    /**  Maps response dto to response from the service, thereby excluding fields from dto **/
    return plainToInstance(AuthResponseDto, response);
  }

  @Get('verify/:id')
  @Version('1')
  async verifyAccount(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.authService.verifyAccount(id);
  }

  // For development purposes only. will be removed later
  @Delete('delete')
  @Version('1')
  async deleteUsers() {
    return this.authService.deleteUsers();
  }
}
