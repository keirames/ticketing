import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}
