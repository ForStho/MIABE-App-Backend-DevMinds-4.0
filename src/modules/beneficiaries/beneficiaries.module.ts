// src/modules/beneficiaries/beneficiaries.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BeneficiariesController } from './beneficiaries.controller';
import { BeneficiariesService } from './beneficiaries.service';
import { Beneficiary, BeneficiarySchema } from './schemas/beneficiary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Beneficiary.name, schema: BeneficiarySchema },
    ]),
  ],
  controllers: [BeneficiariesController],
  providers: [BeneficiariesService],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {}