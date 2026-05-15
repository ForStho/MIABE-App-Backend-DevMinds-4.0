import { Schema, HydratedDocument, Model } from 'mongoose';

/**
 * Options de configuration du plugin slug
 */
interface SlugPluginOptions {
  field: string;
  slugField?: string;
}

type SlugDocument = HydratedDocument<Record<string, unknown>>;

export function slugPlugin(schema: Schema, options?: SlugPluginOptions) {
  // Valeurs par défaut sécurisées
  const field = options?.field || 'name'; // Champ par défaut
  const slugField = options?.slugField || 'slug';

  schema.pre('validate', async function (this: SlugDocument) {
    // Vérification que le champ source existe
    if (!this.isModified(field) && this.get(slugField)) {
      return;
    }

    const value = this.get(field);
    if (typeof value !== 'string' || !value) {
      return;
    }

    const baseSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;
    const Model = this.constructor as Model<SlugDocument>;

    while (
      await Model.exists({
        [slugField]: slug,
        _id: { $ne: this._id },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.set(slugField, slug);
  });
}