// src/modules/auth/services/stellar.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    Horizon,
    Keypair,
    Networks,
    Asset,
    TransactionBuilder,
    Operation,
    Memo,
    BASE_FEE,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
    private readonly logger = new Logger(StellarService.name);
    private readonly server: Horizon.Server;
    private readonly networkPassphrase: string;

    constructor(private configService: ConfigService) {
        const horizonUrl = this.configService.get<string>(
            'STELLAR_HORIZON_URL',
            'https://horizon-testnet.stellar.org',
        );
        const network = this.configService.get<string>('STELLAR_NETWORK', 'testnet');

        this.server = new Horizon.Server(horizonUrl);
        this.networkPassphrase =
            network === 'public' ? Networks.PUBLIC : Networks.TESTNET;

        this.logger.log(`Stellar service initialisé sur ${network} (${horizonUrl})`);
    }

    /**
     * Génère une nouvelle paire de clés Stellar
     */
    generateKeypair(): { publicKey: string; secretKey: string } {
        const pair = Keypair.random();
        return {
            publicKey: pair.publicKey(),
            secretKey: pair.secret(),
        };
    }

    /**
     * Active un compte Stellar via Friendbot (testnet uniquement)
     */
    async fundAccount(publicKey: string): Promise<void> {
        try {
            const response = await fetch(
                `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
            );
            await response.json();
            this.logger.log(`Compte ${publicKey} activé via Friendbot`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Erreur d'activation du compte ${publicKey}: ${message}`);
            throw error;
        }
    }

    /**
     * Récupère le solde d'un compte Stellar
     */
    async getBalance(
        publicKey: string,
    ): Promise<Array<{ asset: string; balance: string }>> {
        try {
            const account = await this.server.loadAccount(publicKey);
            const balances: Array<{ asset: string; balance: string }> = [];

            for (const b of account.balances) {
                if (b.asset_type === 'native') {
                    balances.push({
                        asset: 'XLM',
                        balance: b.balance,
                    });
                } else if (b.asset_type === 'credit_alphanum4' || b.asset_type === 'credit_alphanum12') {
                    balances.push({
                        asset: `${b.asset_code}:${b.asset_issuer}`,
                        balance: b.balance,
                    });
                }
                // On ignore les BalanceLineLiquidityPool
            }

            return balances;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(`Impossible de charger le compte ${publicKey}: ${message}`);
            return [];
        }
    }

    /**
     * Crée une transaction de paiement Stellar
     */
    async createPayment(
        sourceSecret: string,
        destinationPublicKey: string,
        amount: string,
        asset: Asset = Asset.native(),
        memo?: string,
    ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
        const sourceKeypair = Keypair.fromSecret(sourceSecret);
        const sourceAccount = await this.server.loadAccount(
            sourceKeypair.publicKey(),
        );

        const transaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: this.networkPassphrase,
        })
            .addOperation(
                Operation.payment({
                    destination: destinationPublicKey,
                    asset,
                    amount,
                }),
            )
            .addMemo(Memo.text(memo || ''))
            .setTimeout(30)
            .build();

        transaction.sign(sourceKeypair);
        return this.server.submitTransaction(transaction);
    }
}