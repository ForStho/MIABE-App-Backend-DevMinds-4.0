// src/modules/kyc/dto/request/submit-documents.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize, IsEnum } from 'class-validator';

export class KycDocumentDto {
  @ApiProperty({ enum: ['id_card', 'passport', 'proof_of_address', 'selfie'], description: 'Type de document' })
  @IsEnum(['id_card', 'passport', 'proof_of_address', 'selfie'])
  type: string;

  @ApiProperty({ description: 'URL du document' })
  @IsString()
  url: string;
}

export class SubmitDocumentsDto {
  @ApiProperty({
    type: [KycDocumentDto],
    description: 'Liste des documents KYC à soumettre',
  })
  @IsArray()
  @ArrayMinSize(1)
  documents: KycDocumentDto[];
}