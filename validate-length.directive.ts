import {Directive, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators} from '@angular/forms';

export function getStrLength(str: string): number {
  if (!str) {
    str = '';
  }
  const len = str.length ? str.length : 0;
  let reLen = 0;
  for (let i = 0; i < len; i++) {
    if (str.charCodeAt(i) < 27 || str.charCodeAt(i) > 126) {
      // Full width
      reLen += 2;
    } else {
      // Half width
      reLen++;
    }
  }
  return reLen;
}
export function charLengthValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const str = control.value;
    const reLen = getStrLength(str);
    return reLen > maxLength ? {'validateLength': {maxLength}} : null;
  };
}

@Directive({
  selector: '[appValidateLength]',
  providers: [{provide: NG_VALIDATORS, useExisting: ValidateLengthDirective, multi: true}]
})

export class ValidateLengthDirective implements OnChanges, Validator {
  @Input() appValidateLength: number;
  private valFn = Validators.nullValidator;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['appValidateLength'];
    if (change) {
      const val: number | number = change.currentValue;
      this.valFn = charLengthValidator(val);
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl): { [key: string]: any } {
    return this.valFn(control);
  }
}

