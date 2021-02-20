import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello TSS! See documentation at https://documenter.getpostman.com/view/5539822/TWDXmwEi';
  }
}
