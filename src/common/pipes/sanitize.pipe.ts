import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { SanitizeUtil } from '../utils/sanitize.util';

/**
 * Pipe qui nettoie les objets entrants en supprimant certains champs sensibles.
 * Par exemple, on peut vouloir enlever les champs '_id' ou '__v' des body de requête.
 *
 * Exemple d'utilisation globale :
 * app.useGlobalPipes(new SanitizePipe());
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Ne s'applique qu'aux body (pas aux params ou query)
    if (metadata.type === 'body') {
      return SanitizeUtil.sanitize(value);
    }
    return value;
  }
}
