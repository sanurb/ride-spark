import { Injectable } from '@nestjs/common';


@Injectable()
export class AppService {
  getData(): { status: string } {
    return { status: 'OK' };
  }
}
