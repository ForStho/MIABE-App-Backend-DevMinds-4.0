import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../shared/dto/error-response.dto';
import { SuccessResponseDto } from '../../shared/dto/success-response.dto';
import { PaginatedResponseDto } from 'src/shared/dto/paginated-response.dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
    model: TModel,
) => {
    return applyDecorators(
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginatedResponseDto) },
                    {
                        properties: {
                            data: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
            description: `Liste paginée de ${model.name}s`,
        }),
    );
};

export const ApiSuccessResponse = (message: string) => {
    return applyDecorators(
        ApiCreatedResponse({
            type: SuccessResponseDto,
            description: message,
        }),
    );
};

export const ApiErrorResponses = () => {
    return applyDecorators(
        ApiResponse({
            status: 400,
            description: 'Bad Request - Données invalides',
            type: ErrorResponseDto,
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized - Non authentifié',
            type: ErrorResponseDto,
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden - Accès refusé',
            type: ErrorResponseDto,
        }),
        ApiResponse({
            status: 404,
            description: 'Not Found - Ressource introuvable',
            type: ErrorResponseDto,
        }),
        ApiResponse({
            status: 409,
            description: 'Conflict - Conflit de données',
            type: ErrorResponseDto,
        }),
        ApiResponse({
            status: 422,
            description: 'Unprocessable Entity - Erreur de validation',
            type: ErrorResponseDto,
        }),
        ApiResponse({
            status: 429,
            description: 'Too Many Requests - Rate limit dépassé',
            type: ErrorResponseDto,
        }),
        ApiResponse({
            status: 500,
            description: 'Internal Server Error - Erreur serveur',
            type: ErrorResponseDto,
        }),
    );
};