import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must need to be one string.' })
  name: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 8 characters.' })
  password: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email is invalid.' })
  email: string;

  @IsNotEmpty({ message: 'Role is required.' })
  @IsIn(['admin', 'author'])
  role: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be valid.' })
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}

export class LogoutDto {
  @IsNotEmpty({ message: 'User Id is required.' })
  userId: string;
}

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Token Id is required.' })
  token: string;

  @IsNotEmpty({ message: 'User Id is required.' })
  userId: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be valid.' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @IsNotEmpty({ message: 'Token is required.' })
  activationToken: string;
}
