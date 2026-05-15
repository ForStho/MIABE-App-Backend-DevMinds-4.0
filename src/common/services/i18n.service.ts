import { Injectable } from '@nestjs/common';
import { Language, DEFAULT_LANGUAGE } from '../../shared/constants/languages.enum';

@Injectable()
export class I18nService {
    /**
     * Récupère la valeur localisée d'un champ multilingue
     */
    getLocalizedValue<T = string>(
        field: Record<string, T> | undefined,
        language: Language,
        defaultValue?: T
    ): T | undefined {
        if (!field) return defaultValue;

        // Si la valeur exacte existe, la retourner
        if (field[language]) return field[language];

        // Sinon, essayer la langue par défaut
        if (field[DEFAULT_LANGUAGE]) return field[DEFAULT_LANGUAGE];

        // Sinon, prendre la première valeur disponible
        const firstValue = Object.values(field)[0];
        if (firstValue) return firstValue;

        return defaultValue;
    }

    /**
     * Extrait la langue de la requête
     * Priorité: paramètre lang > Accept-Language header > préférence utilisateur > langue par défaut
     */
    extractLanguage(request: any): Language {
        // 1. Vérifier le paramètre de requête
        if (request?.query?.lang && Object.values(Language).includes(request.query.lang)) {
            return request.query.lang as Language;
        }

        // 2. Vérifier le header Accept-Language
        const acceptLanguage = request?.headers?.['accept-language'];
        if (acceptLanguage) {
            const preferredLang = acceptLanguage.split(',')[0].split('-')[0];
            if (Object.values(Language).includes(preferredLang as Language)) {
                return preferredLang as Language;
            }
        }

        // 3. Vérifier la langue de l'utilisateur connecté
        if (request?.user?.metadata?.preferredLanguage) {
            const userLang = request.user.metadata.preferredLanguage;
            if (Object.values(Language).includes(userLang)) {
                return userLang as Language;
            }
        }

        // 4. Langue par défaut
        return DEFAULT_LANGUAGE;
    }

    /**
     * Localise une catégorie
     */
    localizeCategory(category: any, language: Language): any {
        if (!category) return category;

        const localized = { ...category };

        // Localiser le nom
        localized.name = this.getLocalizedValue(category.name, language, category.name?.[DEFAULT_LANGUAGE]);

        // Localiser la description
        if (category.description) {
            localized.description = this.getLocalizedValue(category.description, language);
        }

        // Localiser le SEO
        if (category.seo) {
            localized.seo = {
                ...category.seo,
                title: this.getLocalizedValue(category.seo?.title, language),
                description: this.getLocalizedValue(category.seo?.description, language),
                h1: this.getLocalizedValue(category.seo?.h1, language),
                keywords: category.seo?.keywords,
            };
        }

        return localized;
    }

    /**
     * Localise une liste de catégories
     */
    localizeCategories(categories: any[], language: Language): any[] {
        return categories.map(cat => this.localizeCategory(cat, language));
    }
}