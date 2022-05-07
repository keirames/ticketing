import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimStringPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const element = value[key];

        if (typeof element === 'string') {
          value[key] = element.trim();
        }
      }
    }

    return value;
  }
}
