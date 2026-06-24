import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RegisterCustomerDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  streetAddress!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  countryRegion!: string;

  @IsEmail()
  @Matches(/^[^@\s]+@gmail\.com$/i, { message: 'email must be a Gmail address' })
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
