import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserPayload } from 'src/interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const accessToken = req.session!.accessToken;
          return accessToken;
        },
      ]),
      ignoreExpiration: false,
    } as StrategyOptions);
  }

  async validate(payload: any): Promise<UserPayload> {
    // Addition check user information (banned)
    return { ...payload };
  }
}
