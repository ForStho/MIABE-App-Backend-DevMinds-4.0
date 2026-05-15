import { Module } from '@nestjs/common';
// Ce module ne fait qu'exporter les DTO et interfaces, il n'a pas de providers.
// Il peut être importé dans d'autres modules qui ont besoin de ces classes.
@Module({
  exports: [], // Rien à exporter, car les classes sont utilisées directement
})
export class SharedModule {}
