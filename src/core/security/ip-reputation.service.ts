import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Interface pour la réponse de l'API AbuseIPDB
 */
interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    abuseConfidenceScore: number;
    countryCode?: string;
    usageType?: string;
    isp?: string;
    domain?: string;
    totalReports?: number;
    lastReportedAt?: string;
  };
}

@Injectable()
export class IpReputationService {
  private readonly logger = new Logger(IpReputationService.name);
  private readonly apiUrl = 'https://api.abuseipdb.com/api/v2/check';
  private readonly threshold: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.threshold = this.configService.get('security.ipReputation.threshold', 50);
  }

  /**
   * Vérifie si une adresse IP est suspecte.
   * @param ip - Adresse IP à vérifier
   * @returns true si l'IP est considérée comme suspecte
   */
  async isSuspicious(ip: string): Promise<boolean> {
    const apiKey = this.configService.get<string>('security.ipReputation.apiKey');

    // Si pas de clé API, on désactive la vérification
    if (!apiKey) {
      this.logger.debug('IP reputation check disabled: no API key');
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<AbuseIPDBResponse>(this.apiUrl, {
          params: {
            ipAddress: ip,
            maxAgeInDays: 90,
            verbose: false
          },
          headers: {
            Key: apiKey,
            Accept: 'application/json'
          },
        })
      );

      const data = response.data.data;
      const score = data.abuseConfidenceScore;

      this.logger.debug(`IP ${ip} reputation score: ${score}`);

      return score > this.threshold;

    } catch (error) {
      // Log de l'erreur mais on laisse passer l'IP (dégradation gracieuse)
      this.logger.error(
        `Failed to check IP reputation for ${ip}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return false;
    }
  }

  /**
   * Récupère des informations détaillées sur une IP.
   * @param ip - Adresse IP
   * @returns Informations détaillées ou null si erreur
   */
  async getIpInfo(ip: string): Promise<AbuseIPDBResponse['data'] | null> {
    const apiKey = this.configService.get<string>('security.ipReputation.apiKey');

    if (!apiKey) {
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<AbuseIPDBResponse>(this.apiUrl, {
          params: { ipAddress: ip, maxAgeInDays: 90, verbose: true },
          headers: { Key: apiKey, Accept: 'application/json' },
        })
      );

      return response.data.data;

    } catch (error) {
      this.logger.error(
        `Failed to get IP info for ${ip}: ${(error as Error).message}`,
      );
      return null;
    }
  }
}