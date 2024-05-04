import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Injectable()
export class CookieService {
  sendCookie(value: string, res: FastifyReply) {
    return res.cookie('authtoken', value, {
      httpOnly: true,
      sameSite: true,
      secure: process.env.NODE_ENV === 'development' ? false : true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //1 day
    });
  }
}
