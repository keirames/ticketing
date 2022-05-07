import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const accessToken: string | undefined = req.session!.accessToken;

    if (!accessToken) {
      req.user = undefined;
    } else {
      try {
        const userInfo = await this.jwtService.verifyAsync(accessToken);
        req.user = userInfo;
      } catch (err) {
        req.user = undefined;
      }
    }

    return true;
  }
}
