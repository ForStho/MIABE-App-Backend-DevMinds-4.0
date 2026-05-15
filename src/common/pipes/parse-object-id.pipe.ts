import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Pipe qui valide qu'une chaîne est un ObjectId MongoDB valide.
 * À utiliser sur les paramètres de route de type :id.
 *
 * Exemple :
 * @Get(':id')
 * findOne(@Param('id', ParseObjectIdPipe) id: string) { ... }
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<
  string,
  Types.ObjectId
> {
  transform(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid ObjectId');
    }
    return new Types.ObjectId(value);
  }
}
