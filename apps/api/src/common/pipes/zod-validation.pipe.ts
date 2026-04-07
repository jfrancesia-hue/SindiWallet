import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ZodValidationPipe implements PipeTransform {
  private schema: any;

  constructor(schema: any) {
    this.schema = schema;
  }

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.errors.map(
        (e: any) => `${e.path.join('.')}: ${e.message}`,
      );
      throw new BadRequestException(messages.join('; '));
    }
    return result.data;
  }
}
