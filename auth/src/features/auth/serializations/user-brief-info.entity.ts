import { Exclude } from 'class-transformer';

export class UserBriefInfo {
  id!: string;
  name!: string;
  email!: string;

  @Exclude()
  password!: string;

  constructor(partial: Partial<UserBriefInfo>) {
    Object.assign(this, partial);
  }
}
