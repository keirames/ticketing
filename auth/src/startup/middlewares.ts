import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieSession from 'cookie-session';

export const enhanceMiddlewares = (app: NestExpressApplication) => {
  app.enableCors();

  app.use(
    cookieSession({
      signed: false,
      secure: process.env.NODE_ENV !== 'test',
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        // Modify class-validator errors
        const modifiedErrors = errors.map((err) => {
          const reasons = [];

          for (const constraintKey in err.constraints) {
            const reason = err.constraints[constraintKey];

            reasons.push(reason);
          }

          return {
            property: err.property,
            reasons,
          };
        });

        return new BadRequestException(modifiedErrors);
      },
      validationError: { target: false, value: false },
    }),
  );
};
