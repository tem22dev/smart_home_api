import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'Current password must not be empty' })
  @IsString({ message: 'Current password must be a string' })
  @MinLength(6, { message: 'Current password must be at least 6 characters long' })
  @MaxLength(32, { message: 'Current password must not exceed 32 characters' })
  currentPassword: string;

  @IsNotEmpty({ message: 'New password must not be empty' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @MaxLength(32, { message: 'New password must not exceed 32 characters' })
  newPassword: string;

  @IsNotEmpty({ message: 'Confirm password must not be empty' })
  @IsString({ message: 'Confirm password must be a string' })
  @MinLength(6, { message: 'Confirm password must be at least 6 characters long' })
  @MaxLength(32, { message: 'Confirm password must not exceed 32 characters' })
  confirmPassword: string;
}
