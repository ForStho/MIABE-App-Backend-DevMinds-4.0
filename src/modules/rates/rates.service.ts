// src/modules/rates/rates.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExchangeRate, ExchangeRateDocument } from './schemas/exchange-rate.schema';
import { CurrentRateDto, RateHistoryDto } from './dto/response';
import { Cron, CronExpression } from '@nestjs/schedule';
import { plainToClass } from 'class-transformer';

@Injectable()
export class RatesService {
  private readonly logger = new Logger(RatesService.name);
  private readonly FALLBACK_RATE = 655.96; // Taux fixe EUR/XOF

  constructor(
    @InjectModel(ExchangeRate.name)
    private exchangeRateModel: Model<ExchangeRateDocument>,
  ) {}

  /**
   * Récupère le taux de change actuel
   */
  async getCurrentRate(): Promise<CurrentRateDto> {
    const now = new Date();

    // Chercher le taux le plus récent encore valide
    let rate = await this.exchangeRateModel
      .findOne({
        pair: 'EUR/XOF',
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      })
      .sort({ createdAt: -1 });

    // Si aucun taux valide, utiliser le fallback
    if (!rate) {
      this.logger.warn('Aucun taux de change valide trouvé, utilisation du fallback');
      return {
        pair: 'EUR/XOF',
        rate: this.FALLBACK_RATE,
        source: 'fallback',
        timestamp: new Date(),
      };
    }

    return {
      pair: rate.pair,
      rate: rate.rate,
      source: rate.source,
      timestamp: rate.createdAt,
    };
  }

  /**
   * Historique des taux des 7 derniers jours
   */
  async getRateHistory(): Promise<RateHistoryDto[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rates = await this.exchangeRateModel
      .find({
        pair: 'EUR/XOF',
        createdAt: { $gte: sevenDaysAgo },
      })
      .sort({ createdAt: 1 });

    if (rates.length === 0) {
      // Retourner une entrée avec le taux fallback
      return [
        {
          pair: 'EUR/XOF',
          rate: this.FALLBACK_RATE,
          source: 'fallback',
          validFrom: sevenDaysAgo,
          validUntil: new Date(),
        },
      ];
    }

    return rates.map((r) =>
      plainToClass(RateHistoryDto, r.toObject()),
    );
  }

  /**
   * Met à jour le taux de change (exécuté toutes les heures)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updateExchangeRate(): Promise<void> {
    this.logger.log('Mise à jour du taux de change EUR/XOF...');

    try {
      // Tenter de récupérer le taux depuis une API externe
      // Pour l'instant, on utilise le taux fixe avec une légère variation simulée
      const variation = (Math.random() * 2 - 1) * 0.5; // ±0.5%
      const newRate = Number((this.FALLBACK_RATE * (1 + variation / 100)).toFixed(2));

      const now = new Date();
      const validUntil = new Date();
      validUntil.setHours(validUntil.getHours() + 1);

      await this.exchangeRateModel.create({
        pair: 'EUR/XOF',
        rate: newRate,
        source: 'manual',
        validFrom: now,
        validUntil,
      });

      this.logger.log(`Taux de change mis à jour: 1 EUR = ${newRate} XOF`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erreur lors de la mise à jour du taux: ${message}`);
    }
  }

  /**
   * Récupère le taux de change (méthode utilisée par le module Transferts)
   */
  async getExchangeRate(): Promise<number> {
    const currentRate = await this.getCurrentRate();
    return currentRate.rate;
  }
}