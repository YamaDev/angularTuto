import {animate, animation, sequence, style} from "@angular/animations";

export const FlashAnimations = animation([
  sequence([
    animate('{{ time }}', style({
      backgroundColor: '{{ flashColor }}'
    })),
    animate('{{ time }}', style({
      backgroundColor: 'white)'
    }))
  ]),
]);
