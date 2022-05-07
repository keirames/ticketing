import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { SignInReqDto } from 'src/features/auth/dto/signInReq.dto';
import { SignUpReqDto } from 'src/features/auth/dto/signUpReq.dto';
import { UsersService } from 'src/features/users/users.service';
import { User } from 'src/features/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(data: object | string): Promise<string> {
    const accessToken = await this.jwtService.signAsync(data);
    return accessToken;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const matchUser = await this.usersService.findUserByEmail(email);
    if (!matchUser) {
      return null;
    }

    const isPassMatch = await compare(password, matchUser.password);
    if (!isPassMatch) {
      return null;
    }

    return matchUser;
  }

  async signIn(signInInfo: SignInReqDto): Promise<User> {
    const { email, password } = signInInfo;

    const matchUser = await this.usersService.findUserByEmail(email);
    if (!matchUser) {
      throw new BadRequestException('Email or password not match.');
    }

    const isPassMatch = await compare(password, matchUser.password);
    if (!isPassMatch) {
      throw new BadRequestException('Email or password not match');
    }

    return matchUser;
  }

  async signUp(signUpInfo: SignUpReqDto): Promise<User> {
    const { name, email, password } = signUpInfo;

    const existingUser = await this.usersService.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User is already exist');
    }

    const createdUser = await this.usersService.createUser({
      name,
      email,
      password,
    });

    return createdUser;
  }
}
