// src/modules/auth/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailConfig } from '../../../config/mail.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const mailConfig = this.configService.get<MailConfig>('mail');

    if (!mailConfig || !mailConfig.host) {
      this.logger.warn('Configuration email manquante, les emails ne seront pas envoyés');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password,
      },
    });

    this.logger.log('Service email initialisé');
  }

  /**
   * Envoie un email générique
   */
  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email non envoyé à ${to}: transporteur non configuré`);
      return;
    }

    const mailConfig = this.configService.get<MailConfig>('mail');

    if (!mailConfig) {
      this.logger.warn(`Email non envoyé à ${to}: configuration email manquante`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: mailConfig.from,
        to,
        subject,
        html,
      });
      this.logger.log(`✅ Email envoyé à ${to}: ${subject}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Échec d'envoi d'email à ${to}: ${message}`);
      // On ne throw pas pour ne pas bloquer le flow utilisateur
    }
  }

  /**
   * Log l'OTP dans la console (toujours, pour le développement)
   */
  private logOtpInConsole(email: string, code: string, type: string): void {
    this.logger.debug('────────────────────────────────────────');
    this.logger.debug(`📋 OTP ${type.toUpperCase()}`);
    this.logger.debug(`Email: ${email}`);
    this.logger.debug(`Code: ${code}`);
    this.logger.debug(`Expire dans 15 minutes`);
    this.logger.debug('────────────────────────────────────────');
  }

  /**
   * Envoie l'email de vérification avec OTP
   */
  async sendVerificationEmail(email: string, code: string, firstName: string): Promise<void> {
    // Toujours log l'OTP dans la console pour le développement
    this.logOtpInConsole(email, code, 'vérification email');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">DiasporaConnect</h1>
        <h2>Vérification de votre adresse email</h2>
        <p>Bonjour ${firstName},</p>
        <p>Merci d'avoir créé un compte sur DiasporaConnect. Pour vérifier votre adresse email, utilisez le code ci-dessous :</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
        </div>
        <p>Ce code expire dans 15 minutes.</p>
        <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 14px;">DiasporaConnect - Transferts d'argent France-Bénin</p>
      </div>
    `;

    await this.sendMail(email, 'Vérifiez votre adresse email - DiasporaConnect', html);
  }

  /**
   * Envoie l'email de bienvenue
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Bienvenue sur DiasporaConnect !</h1>
        <p>Bonjour ${firstName},</p>
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
        <ul>
          <li>Envoyer de l'argent vers le Bénin</li>
          <li>Recevoir de l'argent en France</li>
          <li>Suivre vos transferts en temps réel</li>
        </ul>
        <p>Votre wallet Stellar a été créé automatiquement. Vous pouvez le consulter dans votre profil.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 14px;">DiasporaConnect - Transferts d'argent France-Bénin</p>
      </div>
    `;

    await this.sendMail(email, 'Bienvenue sur DiasporaConnect !', html);
  }

  /**
   * Envoie l'email de réinitialisation de mot de passe avec OTP
   */
  async sendPasswordResetEmail(email: string, code: string, firstName: string): Promise<void> {
    this.logOtpInConsole(email, code, 'réinitialisation mot de passe');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">DiasporaConnect</h1>
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${firstName},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code ci-dessous :</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
        </div>
        <p>Ce code expire dans 15 minutes.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 14px;">DiasporaConnect - Transferts d'argent France-Bénin</p>
      </div>
    `;

    await this.sendMail(email, 'Réinitialisation de mot de passe - DiasporaConnect', html);
  }

  /**
   * Envoie l'email d'alerte de connexion
   */
  async sendLoginAlertEmail(email: string, firstName: string, ip: string, userAgent: string): Promise<void> {
    const date = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Alerte de connexion</h1>
        <p>Bonjour ${firstName},</p>
        <p>Une nouvelle connexion à votre compte DiasporaConnect a été détectée :</p>
        <div style="background-color: #fef2f2; padding: 15px; margin: 20px 0; border-radius: 8px; border: 1px solid #fecaca;">
          <p><strong>Date :</strong> ${date}</p>
          <p><strong>Adresse IP :</strong> ${ip}</p>
          <p><strong>Navigateur :</strong> ${userAgent}</p>
        </div>
        <p>Si ce n'était pas vous, changez immédiatement votre mot de passe.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 14px;">DiasporaConnect - Transferts d'argent France-Bénin</p>
      </div>
    `;

    await this.sendMail(email, 'Alerte de connexion - DiasporaConnect', html);
  }

  /**
   * Envoie l'email de confirmation de transfert
   */
  async sendTransferConfirmationEmail(
    email: string,
    firstName: string,
    transferDetails: {
      transactionId: string;
      amount: number;
      beneficiaryName: string;
      direction: string;
      date: Date;
    },
  ): Promise<void> {
    const direction = transferDetails.direction === 'france-to-benin' ? 'France → Bénin' : 'Bénin → France';
    const amount = transferDetails.amount.toFixed(2);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Transfert confirmé</h1>
        <p>Bonjour ${firstName},</p>
        <p>Votre transfert a été effectué avec succès :</p>
        <div style="background-color: #f0fdf4; padding: 15px; margin: 20px 0; border-radius: 8px; border: 1px solid #bbf7d0;">
          <p><strong>Référence :</strong> ${transferDetails.transactionId}</p>
          <p><strong>Montant :</strong> ${amount} EUR</p>
          <p><strong>Bénéficiaire :</strong> ${transferDetails.beneficiaryName}</p>
          <p><strong>Direction :</strong> ${direction}</p>
          <p><strong>Date :</strong> ${transferDetails.date.toLocaleString('fr-FR')}</p>
        </div>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 14px;">DiasporaConnect - Transferts d'argent France-Bénin</p>
      </div>
    `;

    await this.sendMail(email, 'Confirmation de transfert - DiasporaConnect', html);
  }
}