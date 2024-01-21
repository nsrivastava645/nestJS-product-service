import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { JWT_EXPIRES_IN } from 'src/const/constants';
import { ProductModule } from 'src/product/product.module';
import { LoggingMiddleware } from 'src/middlewares/logging.middleware';
//for environment resolution
const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `${environment}.env` });
console.log(process.env.JWT_SECRET);
@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL, {
      dbName: process.env.DATABASE_NAME,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
    ProductModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
