import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IMailService } from './mail-service.interface';

@Injectable()
export class MailService implements IMailService{
  constructor(private readonly mailerService: MailerService ) {}

  async sendOtp(email: string, otp: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `💪Your OTP is: ${otp}. It is valid for 5 minutes.`,
    });
  }


  async sendResetLink(email: string, resetLink: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: `🛠 To reset your password, click the link below:\n\n${resetLink}\n\nThis link is valid for 1 hour.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  }



  async sendMail(email: string, data: 'accept' | 'reject'): Promise<void> {
  const subject = data === 'accept' ? 'Trainer Approval' : 'Trainer Rejection';
  const message =
    data === 'accept'
      ? `<p>Congratulations! Your trainer account has been approved.</p>`
      : `<p>We regret to inform you that your trainer account has been rejected.</p>`;

  await this.mailerService.sendMail({
    to: email,
    subject,
    text: '', 
    html: `
      <div>
        <h2>${subject}</h2>
        ${message}
      </div>
    `,
  });
}

}
