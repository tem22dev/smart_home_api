import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '@/shared/enums';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name must not be empty' })
  fullName: string;

  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  avatar: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsPhoneNumber('VN', { message: 'Invalid phone number format for Vietnam' })
  @IsNotEmpty({ message: 'Phone number must not be empty' })
  phone: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  password: string;

  @IsOptional()
  @IsNumber({}, { message: 'Age must be a number' })
  @Type(() => Number)
  age: number;

  @IsOptional()
  @IsEnum(Gender, {
    message: 'Gender must be one of: male, female',
  })
  gender: Gender;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address: string;

  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active: boolean;
}
