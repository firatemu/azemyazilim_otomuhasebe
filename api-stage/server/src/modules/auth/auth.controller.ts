import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { EmailService } from '../../common/services/email.service';
import { InvitationService } from '../../common/services/invitation.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
    private invitationService: InvitationService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUser('userId') userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUser('userId') userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@GetCurrentUser('userId') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @GetCurrentUser('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Public()
  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Body() body: {
      token: string;
      password: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const result = await this.invitationService.acceptInvitation(
      body.token,
      hashedPassword,
      body.firstName,
      body.lastName,
    );

    // Kullanıcı oluşturulduktan sonra otomatik giriş yap
    // Login metodunu kullan (şifre zaten hash'lenmiş, ama login'de tekrar hash kontrolü yapılacak)
    // Bu yüzden kullanıcıyı bulup token oluşturuyoruz
    const user = await this.authService.getProfile(result.user.id);
    
    // Login metodunu çağırmak yerine, kullanıcı bilgilerini döndürüyoruz
    // Frontend'de kullanıcı login sayfasına yönlendirilebilir
    return {
      ...result,
      message: 'Davet başarıyla kabul edildi. Lütfen giriş yapın.',
      user,
    };
  }

  @Public()
  @Post('test-welcome-email')
  @HttpCode(HttpStatus.OK)
  async testWelcomeEmail(
    @Body() body: { email: string; firstName: string; lastName: string },
  ) {
    try {
      await this.emailService.sendWelcomeEmail(
        body.email,
        body.firstName,
        body.lastName,
      );
      return {
        success: true,
        message: `Hoş geldiniz maili gönderildi: ${body.email}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Mail gönderme hatası: ${error.message}`,
      };
    }
  }
}
