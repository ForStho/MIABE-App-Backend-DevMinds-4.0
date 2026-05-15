import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour les paramètres de pagination dans les requêtes GET.
 * Utilisé automatiquement avec ValidationPipe.
 */
export class PaginationDto {
  /**
   * Numéro de la page (commence à 1).
   * @default 1
   */
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Numéro de la page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Nombre d'éléments par page.
   * @default 10
   * @maximum 100 (pour éviter les abus)
   */
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: "Nombre d'éléments par page",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Export du type pour Swagger
export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};