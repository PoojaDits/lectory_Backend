import { BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/users.schema';
import { ChangePasswordDto, RegisterDto, ResetPasswordDto, VerifyOtpDto } from './dto';
import { UserRole, SellerStatus } from '../common/enums';
import { AUTH_MESSAGES, OTP_MESSAGES, USER_MESSAGES } from '../common/constants';
import {
  JwtPayload,
  RegisterResponse,
  LoginResponse,
  RefreshResponse,
} from '../common/interfaces';
import { MailService } from '../mail/mail.service';
import { CartsService } from '../carts/carts.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
    private cartsService: CartsService,
  ) {}

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private async signTokens(payload: JwtPayload) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: (this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '7d') as any,
    });
    return { access_token, refresh_token };
  }

  // ── REGISTER (single user document with role-specific fields) ──
  async register(dto: RegisterDto): Promise<RegisterResponse> {
    try {
      const userData: any = {
        email: dto.email,
        role: dto.role,
        isEmailVerified: false,
      };

      if (dto.role === UserRole.CUSTOMER) {
        userData.firstName = dto.firstName;
        userData.lastName = dto.lastName;
      } else if (dto.role === UserRole.SELLER) {
        userData.businessName = dto.businessName;
        userData.contactPerson = dto.contactPerson;
        userData.mobileNumber = dto.mobileNumber;
        userData.sellerStatus = SellerStatus.PENDING;
      }

      const user = await this.usersService.createUser(userData, dto.password);

      // Every customer starts with one empty cart. The service is idempotent,
      // so calling it here and later from the frontend is safe.
      if (user.role === UserRole.CUSTOMER) {
        await this.cartsService.create(user.id);
      }

      await this.sendOtp(
        user.id,
        user.email,
        user.role,
        user.firstName || user.contactPerson,
      );

      return {
        message: OTP_MESSAGES.SENT,
        userId: user.id,
        email: user.email,
        role: user.role,
        sellerStatus: user.sellerStatus,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Register failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  // ── OTP ──
  async sendOtp(userId: string, email?: string, role?: UserRole, name?: string) {
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const minutes = Number(this.config.get('OTP_EXPIRE_MINUTES', 5));
    const expiresAt = new Date(Date.now() + minutes * 60000);

    await this.usersService.setOtp(userId, otpHash, expiresAt);
    this.logger.log(`OTP for user ${userId} (${email}): ${otp} (expires ${minutes}m)`);

    if (email) {
      await this.mailService.sendOtpEmail(email, otp, name, role);
    }
    return true;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    try {
      const user = await this.usersService.findByEmail(dto.email, true);
      if (!user || !user.otpCode || !user.otpExpiresAt) {
        throw new BadRequestException(OTP_MESSAGES.INVALID);
      }
      if (user.otpExpiresAt < new Date()) {
        throw new BadRequestException(OTP_MESSAGES.INVALID);
      }
      if (user.isEmailVerified) {
        throw new BadRequestException(OTP_MESSAGES.ALREADY_VERIFIED);
      }

      const ok = await bcrypt.compare(dto.otp, user.otpCode);
      if (!ok) throw new BadRequestException(OTP_MESSAGES.INVALID);

      await this.usersService.markEmailVerified(user.id);
      return { message: OTP_MESSAGES.VERIFIED };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Verify OTP failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) throw new BadRequestException(USER_MESSAGES.USER_NOT_FOUND);
      if (user.isEmailVerified) throw new BadRequestException(OTP_MESSAGES.ALREADY_VERIFIED);

      await this.sendOtp(
        user.id,
        user.email,
        user.role,
        user.firstName || user.contactPerson,
      );
      return { message: OTP_MESSAGES.RESENT };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Resend OTP failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  // ── VALIDATE (Local strategy) ──
  async validateUser(email: string, password: string): Promise<UserDocument> {
    try {
      const user = await this.usersService.findByEmail(email, true);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
      }
      if (!user.isEmailVerified) {
        throw new ForbiddenException(OTP_MESSAGES.NOT_VERIFIED);
      }
      if (
        user.role === UserRole.SELLER &&
        user.sellerStatus !== SellerStatus.APPROVED
      ) {
        throw new ForbiddenException(AUTH_MESSAGES.SELLER_PENDING);
      }
      return user;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Validate user failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  // ── LOGIN ──
  async login(user: UserDocument): Promise<LoginResponse> {
    try {
      const userId = user.id;
      const payload: JwtPayload = { sub: userId, email: user.email, role: user.role };
      const tokens = await this.signTokens(payload);
      const refreshHash = await bcrypt.hash(tokens.refresh_token, 10);
      await this.usersService.setRefreshToken(userId, refreshHash);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: userId,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          contactPerson: user.contactPerson,
          mobileNumber: user.mobileNumber,
          sellerStatus: user.sellerStatus,
          createdAt: (user as any).createdAt,
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Login failed: ${err.message}`, err.stack);
      throw error;
    }
  }



  // ── FORGOT PASSWORD ──
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) throw new BadRequestException(USER_MESSAGES.USER_NOT_FOUND);

      await this.sendOtp(
        user.id,
        user.email,
        user.role,
        user.firstName || user.contactPerson,
      );

      return { message: OTP_MESSAGES.SENT };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Forgot password failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  // ── RESET PASSWORD WITH OTP ──
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.usersService.findByEmail(dto.email, true);
      if (!user || !user.otpCode || !user.otpExpiresAt) {
        throw new BadRequestException(OTP_MESSAGES.INVALID);
      }
      if (user.otpExpiresAt < new Date()) {
        throw new BadRequestException(OTP_MESSAGES.INVALID);
      }

      const ok = await bcrypt.compare(dto.otp, user.otpCode);
      if (!ok) throw new BadRequestException(OTP_MESSAGES.INVALID);

      await this.usersService.updatePassword(user.id, dto.newPassword);
      await this.usersService.clearOtp(user.id);
      await this.usersService.setRefreshToken(user.id, null);

      return { message: 'Password reset successfully' };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Reset password failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  // ── CHANGE PASSWORD WHILE LOGGED IN ──
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.usersService.findById(userId, true);
      if (!user) throw new BadRequestException(USER_MESSAGES.USER_NOT_FOUND);

      const currentOk = await bcrypt.compare(dto.currentPassword, user.password);
      if (!currentOk) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      const samePassword = await bcrypt.compare(dto.newPassword, user.password);
      if (samePassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      await this.usersService.updatePassword(user.id, dto.newPassword);
      await this.usersService.setRefreshToken(user.id, null);

      return { message: 'Password changed successfully' };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Change password failed: ${err.message}`, err.stack);
      throw error;
    }
  }


  // ── REFRESH ──
  async refresh(userId: string, refreshToken: string): Promise<RefreshResponse> {
    try {
      const user = await this.usersService.findById(userId, true);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);
      }

      const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!ok) throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);

      const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
      const tokens = await this.signTokens(payload);
      await this.usersService.setRefreshToken(
        user.id,
        await bcrypt.hash(tokens.refresh_token, 10),
      );
      return tokens;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Refresh token failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  // ── LOGOUT ──
  async logout(userId: string): Promise<{ message: string }> {
    try {
      await this.usersService.setRefreshToken(userId, null);
      return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Logout failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}
