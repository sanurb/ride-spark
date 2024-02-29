import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsDateOnlyString(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: 'isDateOnlyString',
      target: target.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const regex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
          const isValid = typeof value === 'string' && regex.test(value);
          if (!isValid) {
            console.log(`Failed validation for property: ${args.property}, value: ${value}`);
          }
          return isValid;
        },
        defaultMessage(args: ValidationArguments) {
          return '$property must be in YYYY-MM-DD format';
        },
      },
    });
  };
}
