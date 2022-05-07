import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { SignInReqDto } from 'src/features/auth/dto/signInReq.dto';
import { SignUpReqDto } from 'src/features/auth/dto/signUpReq.dto';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from 'src/features/auth/guards/local-auth.guard';
import { UserBriefInfo } from 'src/features/auth/serializations/user-brief-info.entity';
import { UserPayload } from 'src/interface';
import { TrimStringPipe } from 'src/pipes';
import { User } from 'src/features/users/schemas/user.schema';
import { AuthService } from './auth.service';
import { CurrentUserGuard } from 'src/features/auth/guards/current-user.guard';

@Controller('/api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(LocalAuthGuard)
  @Post('/users/sign-in')
  async signIn(@Req() req: Request) {
    // Must ensure that there is no way we receive unexpected user's value.
    const user = req.user as User;
    const { name, email } = user;

    const accessToken = await this.authService.generateToken({
      id: (user as any).id,
      name,
      email,
    });

    // store token on session object
    req.session = {
      accessToken,
    };

    return new UserBriefInfo({
      id: (user as any).id,
      email,
      name,
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/users/sign-up')
  async signUp(
    @Req() req: Request,
    @Body(TrimStringPipe) signUpInfo: SignUpReqDto,
  ): Promise<UserBriefInfo> {
    const user = await this.authService.signUp(signUpInfo);
    const { name, email } = user;

    const accessToken = await this.authService.generateToken({
      id: (user as any).id,
      name,
      email,
    });

    // store token on session object
    req.session = {
      accessToken,
    };

    return new UserBriefInfo({
      id: (user as any).id,
      email,
      name,
    });
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('/users/sign-out')
  signOut(@Req() req: Request): void {
    // destroy the session
    req.session = null;

    return;
  }

  @UseGuards(CurrentUserGuard)
  @Get('/users/current-user')
  getCurrentUser(@Req() req: Request): { currentUser: UserPayload | null } {
    const user = req.user as UserPayload | undefined;

    if (user) return { currentUser: user };

    return { currentUser: null };
  }
}
