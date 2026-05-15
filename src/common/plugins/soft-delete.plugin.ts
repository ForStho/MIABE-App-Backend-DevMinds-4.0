import { Schema, Query, HydratedDocument, Model, Aggregate } from 'mongoose';

/**
 * Type représentant un document utilisant le soft delete.
 */
type SoftDeleteDocument = HydratedDocument<{
  deletedAt?: Date | null;
}>;

/**
 * Type représentant un stage MongoDB dans un pipeline aggregate.
 *
 * On évite volontairement `any` pour respecter les règles ESLint
 * strictes comme :
 *
 * - no-unsafe-member-access
 * - no-unsafe-assignment
 */
interface AggregateStage {
  $match?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Plugin Mongoose permettant d'implémenter un soft delete robuste.
 *
 * Principe :
 * Au lieu de supprimer physiquement un document dans MongoDB,
 * on ajoute une date dans le champ `deletedAt`.
 *
 * deletedAt = null  -> document actif
 * deletedAt = Date  -> document supprimé
 */
export function softDeletePlugin(schema: Schema) {
  /**
   * Ajout du champ deletedAt dans le schema
   */
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
      // index: true,
    },
  });

  /**
   * Index partiel très important pour les performances.
   *
   * MongoDB indexera seulement les documents actifs.
   */
  schema.index(
    { deletedAt: 1 },
    {
      partialFilterExpression: { deletedAt: null },
    },
  );

  /**
   * Middleware exécuté avant toutes les requêtes find
   *
   * Cela couvre :
   * - find
   * - findOne
   * - findById
   * - findOneAndUpdate
   */
  schema.pre(/^find/, function (this: Query<unknown, SoftDeleteDocument>) {
    const filter = this.getFilter();

    /**
     * Si la requête ne demande pas explicitement deletedAt,
     * on filtre automatiquement les documents supprimés.
     */
    if (filter.deletedAt === undefined) {
      this.where({ deletedAt: null });
    }
  });

  /**
   * Middleware pour countDocuments
   */
  schema.pre(
    'countDocuments',
    function (this: Query<number, SoftDeleteDocument>) {
      const filter = this.getFilter();

      if (filter.deletedAt === undefined) {
        this.where({ deletedAt: null });
      }
    },
  );

  /**
   * Middleware pour les pipelines aggregate
   *
   * Les pipelines MongoDB ne passent pas par "find",
   * donc on injecte automatiquement un filtre.
   */
  schema.pre('aggregate', function (this: Aggregate<unknown[]>) {
    const pipeline = this.pipeline() as AggregateStage[];

    /**
     * Vérifie si le pipeline contient déjà
     * un filtre sur deletedAt
     */
    const hasDeletedFilter = pipeline.some((stage) => {
      if ('$match' in stage && stage.$match) {
        return Object.prototype.hasOwnProperty.call(stage.$match, 'deletedAt');
      }
      return false;
    });

    /**
     * Si aucun filtre n'existe,
     * on injecte automatiquement :
     *
     * { deletedAt: null }
     */
    if (!hasDeletedFilter) {
      pipeline.unshift({
        $match: { deletedAt: null },
      });
    }
  });

  /**
   * Empêche les suppressions physiques accidentelles.
   *
   * Si quelqu'un appelle deleteOne(),
   * cela devient automatiquement un soft delete.
   */
  schema.pre(
    'deleteOne',
    { document: true, query: false },
    async function (this: SoftDeleteDocument) {
      this.deletedAt = new Date();
      await this.save();
    },
  );

  /**
   * Méthode statique permettant d'inclure
   * les documents supprimés dans une recherche.
   */
  schema.statics.withDeleted = function (this: Model<SoftDeleteDocument>) {
    return this.find();
  };

  /**
   * Méthode statique permettant de récupérer
   * uniquement les documents supprimés.
   */
  schema.statics.onlyDeleted = function (this: Model<SoftDeleteDocument>) {
    return this.find({
      deletedAt: { $ne: null },
    });
  };

  /**
   * Méthode d'instance pour effectuer un soft delete.
   *
   * Exemple :
   * await product.softDelete()
   */
  schema.methods.softDelete = async function (this: SoftDeleteDocument) {
    this.deletedAt = new Date();
    await this.save();
  };

  /**
   * Méthode d'instance permettant de restaurer
   * un document supprimé.
   */
  schema.methods.restore = async function (this: SoftDeleteDocument) {
    this.deletedAt = null;
    await this.save();
  };
}
