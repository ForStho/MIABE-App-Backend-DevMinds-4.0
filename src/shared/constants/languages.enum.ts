/**
 * Énumération des langues supportées par l'application
 */
export enum Language {
    FR = 'fr', // Français
    EN = 'en', // Anglais
    ES = 'es', // Espagnol
    PT = 'pt', // Portugais
    AR = 'ar', // Arabe
    ZH = 'zh', // Chinois
}

export const DEFAULT_LANGUAGE = Language.FR;
export const SUPPORTED_LANGUAGES = Object.values(Language);