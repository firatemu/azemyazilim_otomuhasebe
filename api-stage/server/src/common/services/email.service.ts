import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Postfix SMTP yapılandırması (localhost:587)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // STARTTLS kullanıyoruz
      auth: process.env.SMTP_USER
        ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
        : undefined,
      tls: {
        rejectUnauthorized: false, // Localhost için self-signed cert kabul et
      },
    });

    // Bağlantıyı test et
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.warn(`SMTP bağlantı hatası: ${error.message}`);
      } else {
        this.logger.log('SMTP bağlantısı başarılı');
      }
    });
  }

  async sendWelcomeEmail(
    to: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    this.logger.log(`📧 Hoş geldiniz maili gönderiliyor: ${to} (${firstName} ${lastName})`);
    const fullName = `${firstName} ${lastName}`.trim();
    const subject = 'Hoş Geldiniz - Oto Muhasebe';

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hoş Geldiniz</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #191970; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Oto Muhasebe</h1>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #191970; margin-top: 0;">Hoş Geldiniz ${fullName}!</h2>
        
        <p>Oto Muhasebe ailesine katıldığınız için teşekkür ederiz. Hesabınız başarıyla oluşturuldu.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #191970;">
            <p style="margin: 0;"><strong>E-posta Adresiniz:</strong> ${to}</p>
            <p style="margin: 10px 0 0 0;"><strong>İsim:</strong> ${fullName}</p>
        </div>
        
        <p>Artık Oto Muhasebe sistemini kullanmaya başlayabilirsiniz. Sistemimiz ile:</p>
        <ul style="padding-left: 20px;">
            <li>Stok yönetimi yapabilirsiniz</li>
            <li>Invoice ve sipariş takibi yapabilirsiniz</li>
            <li>Cari hesap yönetimi yapabilirsiniz</li>
            <li>Detaylı raporlar alabilirsiniz</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://panel.otomuhasebe.com'}" 
               style="display: inline-block; background-color: #191970; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Sisteme Giriş Yap
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Herhangi bir sorunuz veya öneriniz için bizimle iletişime geçebilirsiniz.<br>
            <strong>E-posta:</strong> <a href="mailto:mail@otomuhasebe.com">mail@otomuhasebe.com</a>
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
            Bu otomatik bir e-postadır. Lütfen bu e-postaya yanıt vermeyiniz.
        </p>
    </div>
</body>
</html>
    `.trim();

    const textTemplate = `
Hoş Geldiniz ${fullName}!

Oto Muhasebe ailesine katıldığınız için teşekkür ederiz. Hesabınız başarıyla oluşturuldu.

E-posta Adresiniz: ${to}
İsim: ${fullName}

Artık Oto Muhasebe sistemini kullanmaya başlayabilirsiniz. Sistemimiz ile:
- Stok yönetimi yapabilirsiniz
- Invoice ve sipariş takibi yapabilirsiniz
- Cari hesap yönetimi yapabilirsiniz
- Detaylı raporlar alabilirsiniz

Sisteme giriş yapmak için: ${process.env.FRONTEND_URL || 'https://panel.otomuhasebe.com'}

Herhangi bir sorunuz veya öneriniz için bizimle iletişime geçebilirsiniz.
E-posta: mail@otomuhasebe.com

Bu otomatik bir e-postadır. Lütfen bu e-postaya yanıt vermeyiniz.
    `.trim();

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'Oto Muhasebe <mail@otomuhasebe.com>',
        // replyTo kaldırıldı - yanıt verilmesini engellemek için
        to,
        subject,
        text: textTemplate,
        html: htmlTemplate,
        headers: {
          'X-Auto-Response-Suppress': 'All', // Otomatik yanıtları engelle
          'Precedence': 'bulk', // Toplu mail olarak işaretle
        },
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Hoş geldiniz maili gönderildi: ${to} - MessageId: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`Hoş geldiniz maili gönderilemedi: ${to} - Hata: ${error.message}`);
      // Mail gönderme hatası register işlemini durdurmamalı
      // Sadece log'a kaydediyoruz
    }
  }

  async sendInvitationEmail(
    to: string,
    tenantName: string,
    inviteUrl: string,
  ): Promise<void> {
    this.logger.log(`📧 Davet maili gönderiliyor: ${to} (${tenantName})`);
    const subject = `${tenantName} - Oto Muhasebe Daveti`;

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Davet</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #191970; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Oto Muhasebe</h1>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #191970; margin-top: 0;">Davet Edildiniz!</h2>
        
        <p><strong>${tenantName}</strong> sizi Oto Muhasebe sistemine davet etti.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #191970;">
            <p style="margin: 0;"><strong>Davet Edildiğiniz Firma:</strong> ${tenantName}</p>
            <p style="margin: 10px 0 0 0;"><strong>E-posta Adresiniz:</strong> ${to}</p>
        </div>
        
        <p>Daveti kabul etmek için aşağıdaki butona tıklayın:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="display: inline-block; background-color: #191970; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Daveti Kabul Et
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Bu davet 7 gün geçerlidir. Eğer bu daveti siz istemediyseniz, bu e-postayı görmezden gelebilirsiniz.<br>
            <strong>E-posta:</strong> <a href="mailto:mail@otomuhasebe.com">mail@otomuhasebe.com</a>
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
            Bu otomatik bir e-postadır. Lütfen bu e-postaya yanıt vermeyiniz.
        </p>
    </div>
</body>
</html>
    `.trim();

    const textTemplate = `
Davet Edildiniz!

${tenantName} sizi Oto Muhasebe sistemine davet etti.

Davet Edildiğiniz Firma: ${tenantName}
E-posta Adresiniz: ${to}

Daveti kabul etmek için: ${inviteUrl}

Bu davet 7 gün geçerlidir. Eğer bu daveti siz istemediyseniz, bu e-postayı görmezden gelebilirsiniz.

Herhangi bir sorunuz veya öneriniz için bizimle iletişime geçebilirsiniz.
E-posta: mail@otomuhasebe.com

Bu otomatik bir e-postadır. Lütfen bu e-postaya yanıt vermeyiniz.
    `.trim();

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'Oto Muhasebe <mail@otomuhasebe.com>',
        to,
        subject,
        text: textTemplate,
        html: htmlTemplate,
        headers: {
          'X-Auto-Response-Suppress': 'All',
          'Precedence': 'bulk',
        },
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Davet maili gönderildi: ${to} - MessageId: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`Davet maili gönderilemedi: ${to} - Hata: ${error.message}`);
      throw error; // Davet emaili gönderilemezse hata fırlat
    }
  }
  async sendMaturityReminderEmail(
    to: string,
    userName: string,
    items: any[],
  ): Promise<void> {
    this.logger.log(`📧 Vade hatırlatma maili gönderiliyor: ${to}`);
    const subject = 'Vade Hatırlatması - Oto Muhasebe';

    const itemsHtml = items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">${item.cekNo || item.seriNo}</td>
        <td style="padding: 10px;">${item.account?.unvan}</td>
        <td style="padding: 10px;">${new Date(item.vade).toLocaleDateString('tr-TR')}</td>
        <td style="padding: 10px; text-align: right;">₺${Number(item.remainingAmount).toLocaleString('tr-TR')}</td>
      </tr>
    `).join('');

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Vade Hatırlatması</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #191970; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Vade Hatırlatması</h1>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
        <p>Sayın ${userName},</p>
        <p>Aşağıdaki evrakların vadeleri yaklaşmaktadır. Lütfen gerekli kontrolleri yapınız.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white;">
            <thead>
                <tr style="background-color: #f2f2f2; border-bottom: 2px solid #191970;">
                  <th style="padding: 10px; text-align: left;">Evrak No</th>
                  <th style="padding: 10px; text-align: left;">Cari Unvan</th>
                  <th style="padding: 10px; text-align: left;">Vade</th>
                  <th style="padding: 10px; text-align: right;">Kalan Tutar</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://panel.otomuhasebe.com'}/cek-senet" 
               style="display: inline-block; background-color: #191970; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Detayları Gör
            </a>
        </div>
        
        <p style="color: #666; font-size: 13px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            Sisteme giriş yaparak tüm vadelerinizi takip edebilirsiniz.<br>
            <strong>Destek:</strong> mail@otomuhasebe.com
        </p>
    </div>
</body>
</html>
    `.trim();

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'Oto Muhasebe <mail@otomuhasebe.com>',
        to,
        subject,
        html: htmlTemplate,
      });
      this.logger.log(`Vade hatırlatma maili gönderildi: ${to}`);
    } catch (error: any) {
      this.logger.error(`Vade hatırlatma maili gönderilemedi: ${to} - Hata: ${error.message}`);
    }
  }
}

