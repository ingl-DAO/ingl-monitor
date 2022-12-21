import { IsEmail, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class UserAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
  
  @IsString()
  reset_link: string;
}

export class UserPostDto {
  @IsEmail()
  email: string;

  @IsString()
  fullname: string;
}

export class ResetPassword {
  reset_link: string;
  is_used: boolean;
  created_at: string;
}

export class User extends UserPostDto {
  _id: ObjectId;
  password: string;
  is_admin: boolean;
  created_at: string;
  resetPassword: ResetPassword;
}

export enum CollectionName {
  InglState = 'ingl_state',
  BetaUsers = 'ingl_beta_users',
}

export interface InglState {
  vote_account_key: string;
  proposal_numeration: number;
  date_finalized: number;
}
