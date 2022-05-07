import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class SignUpReqDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail({}, { message: 'Invalid email' })
  email!: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(30)
  password!: string;
}
