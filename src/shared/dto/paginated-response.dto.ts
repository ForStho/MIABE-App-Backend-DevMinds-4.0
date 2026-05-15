import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
    @ApiProperty({
        description: 'Page actuelle',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Nombre d’éléments par page',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Nombre total d’éléments',
        example: 100,
    })
    total: number;

    @ApiProperty({
        description: 'Nombre total de pages',
        example: 10,
    })
    totalPages: number;

    @ApiProperty({
        description: 'Indique s’il existe une page suivante',
        example: true,
    })
    hasNext: boolean;

    @ApiProperty({
        description: 'Indique s’il existe une page précédente',
        example: false,
    })
    hasPrev: boolean;

    constructor(partial: Partial<PaginationMetaDto>) {
        Object.assign(this, partial);
    }
}

export class PaginatedResponseDto<T> {
    @ApiProperty({
        description: 'Liste des éléments paginés',
        isArray: true,
    })
    data: T[];

    @ApiProperty({
        description: 'Informations de pagination',
        type: PaginationMetaDto,
    })
    meta: PaginationMetaDto;

    constructor(data: T[], meta: PaginationMetaDto) {
        this.data = data;
        this.meta = meta;
    }
}