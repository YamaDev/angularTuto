import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'fullname'
})

export class FullNamePipe implements PipeTransform {

  transform(value: { firstName: string, lastName: string }): string {

    return `${value.lastName.toUpperCase()} ${value.firstName}`

  }
}
