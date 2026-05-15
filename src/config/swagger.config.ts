import { INestApplication } from '@nestjs/common';
import {
    SwaggerModule,
    DocumentBuilder,
    SwaggerCustomOptions,
    OpenAPIObject,
} from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

export class SwaggerConfig {
    static setup(app: INestApplication, configService?: ConfigService): void {
        const config = this.createDocumentConfig();
        const document = SwaggerModule.createDocument(app, config, {
            deepScanRoutes: true,
            operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
        });

        this.saveSwaggerJson(document);

        const customOptions: SwaggerCustomOptions = {
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                docExpansion: 'list',
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                syntaxHighlight: {
                    theme: 'monokai',
                },
                defaultModelsExpandDepth: 3,
                defaultModelExpandDepth: 3,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
            customSiteTitle: 'Backend Starter API Documentation',
            customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
        .swagger-ui .scheme-container { margin: 10px 0; padding: 10px }
        .swagger-ui .btn.authorize { background-color: #4CAF50; border-color: #4CAF50 }
        .swagger-ui .btn.authorize svg { fill: white }
      `,
            customJs: `
        console.log('🚀 Swagger UI chargé avec succès!');
      `,
            customfavIcon: 'https://nestjs.com/favicon.ico',
        };

        SwaggerModule.setup('api/docs', app, document, customOptions);
    }

    private static createDocumentConfig() {
        const config = new DocumentBuilder()
            .setTitle('🚀 BACKEND STARTER PRO API')
            .setDescription(`
        # API REST Professionnelle pour Applications SaaS
        
        ## ✨ Caractéristiques
        - **Authentification JWT** avec refresh token
        - **RBAC** (Role Based Access Control)
        - **Rate limiting** avancé
        - **Audit logs** complets
        - **Soft delete** sur toutes les entités
        - **Validation** stricte des données
        - **Pagination** optimisée
        - **Recherche** et filtrage
        
        ## 🔐 Authentification
        Pour utiliser les endpoints protégés, cliquez sur le bouton **Authorize** 
        et entrez votre token JWT au format: \`Bearer <votre-token>\`
        
        *Obtenez votre token via \`/api/auth/login\`*
      `)
            .setVersion('1.0.0')
            .setTermsOfService('https://example.com/terms')
            .setContact(
                'Support Technique',
                'https://example.com/support',
                'support@example.com',
            )
            .setLicense(
                'MIT License',
                'https://opensource.org/licenses/MIT',
            )

            // Tags avec descriptions
            .addTag('auth', '🔐 Authentification & Gestion des sessions')
            .addTag('users', '👥 Gestion des utilisateurs')
            .addTag('admin', '👑 Administration')
            .addTag('health', '💓 Health Check')
            .addTag('activity-logs', '📋 Logs d\'activité')
            .addTag('uploads', '📁 Gestion des fichiers')
            .addTag('notifications', '🔔 Notifications')
            .addTag('mail', '📧 Emails')

            // Sécurité
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Entrez votre token JWT',
                },
                'JWT-auth',
            )
            .addApiKey(
                {
                    type: 'apiKey',
                    name: 'X-API-Key',
                    in: 'header',
                    description: 'Clé API pour les services externes',
                },
                'api-key',
            )
            .addBasicAuth()
            .addCookieAuth('refresh_token')

            // Serveurs
            .addServer('http://localhost:3000', 'Serveur de développement')
            .addServer('https://api.staging.example.com', 'Serveur de staging')
            .addServer('https://api.example.com', 'Serveur de production')

            // Variables globales
            .addGlobalParameters({
                in: 'header',
                name: 'X-Request-ID',
                required: false,
                schema: { type: 'string' },
                description: 'ID de requête pour le tracing',
            })
            .addGlobalParameters({
                in: 'header',
                name: 'X-API-Version',
                required: false,
                schema: { 
                    type: 'string', 
                    enum: ['1.0', '2.0'],
                    default: '1.0'
                },
                description: 'Version de l\'API',
            });

        return config.build();
    }

    private static saveSwaggerJson(document: OpenAPIObject): void {
        try {
            const outputPath = join(process.cwd(), 'swagger.json');
            writeFileSync(outputPath, JSON.stringify(document, null, 2));
            console.log(`📝 Swagger JSON sauvegardé: ${outputPath}`);
        } catch (error) {
            console.error('❌ Erreur sauvegarde Swagger JSON:', error.message);
        }
    }
}