import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { SignUpReqDto } from 'src/features/auth/dto/signUpReq.dto';
import { SALT_ROUND } from 'src/constants';
import { UserDocument, User, UserAttrs } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findUserByEmail(email: string) {
    return this.userModel.findOne({
      email,
    });
  }

  async hashPassword(password: string) {
    const hashedPass = await hash(password, SALT_ROUND);

    return hashedPass;
  }

  async createUser(userInfo: SignUpReqDto) {
    const { name, email, password } = userInfo;

    const hashedPass = await this.hashPassword(password);

    const user = new this.userModel<UserAttrs>({
      name,
      email,
      password: hashedPass,
    });

    return user.save();
  }
}
