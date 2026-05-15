import { Module, DynamicModule, Global } from '@nestjs/common';

@Global()
@Module({})
export class ResilienceModule {
  static forRoot(): DynamicModule {
    return {
      module: ResilienceModule,
      providers: [],
      exports: [],
    };
  }
}
