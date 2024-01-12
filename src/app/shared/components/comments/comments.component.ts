import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Comment} from "../../../core/models/comment.model";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {
  animate,
  state,
  style,
  transition,
  trigger,
  query,
  group,
  sequence,
  stagger,
  animateChild, useAnimation
} from "@angular/animations";
import {FlashAnimations} from "../../animations/flash.animations";
import {slideAndFadeAnimations} from "../../animations/slide-and-fade.animations";

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  animations: [
    trigger('list', [
      transition(':enter', [
        query('@listItem', [
          stagger(150, [
            animateChild()
          ])
        ])
      ])
    ]),
    trigger('listItem', [
      state('default', style({
        transform: 'scale(1)',
        backgroundColor: 'white',
        zIndex: 1
      })),
      state('active', style({
        transform: 'scale(1.05)',
        backgroundColor: 'rgb(201,157,242)',
        zIndex: 2
      })),
      transition('default => active', [
        animate('100ms ease-in-out')
      ]),
      transition('active => default', [
        animate('500ms ease-in-out')
      ]),
      // transition(':enter => *', [
      // transition(':leave => *', [
      transition('void => *', [
        query('.comment-text, .comment-date', [
          style({
            opacity: 0,
          })]),
        useAnimation(slideAndFadeAnimations, {
          params: {
            time: '300ms',
            startColor: 'rgb(201,157,242)'
          }
        }),
        group([
          useAnimation(FlashAnimations, {
            params: {
              time: '150ms', flashColor: 'rgb(201,157,242)'
            }
          }),
          query('.comment-text', [
            animate('250ms', style({
              opacity: 1,
            }))]),
          query('.comment-date', [
            animate('750ms', style({
              opacity: 1,
            })),
          ])
        ]),

      ])
    ])
  ]
})
export class CommentsComponent implements OnInit {

  @Input() comments!: Comment[];
  @Output() newComment = new EventEmitter<string>()

  commentCtrl!: FormControl;
  animationStates: { [key: number]: 'default' | 'active' } = {};

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.commentCtrl = this.formBuilder.control('', [Validators.required, Validators.minLength(10)]);
    for (let index in this.comments) {
      this.animationStates[index] = 'default'
    }
  }

  onLeaveComment() {
    if (this.commentCtrl.invalid) {
      return;
    }
    const maxId = Math.max(...this.comments.map(comment => comment.id));
    this.comments.unshift({
      id: maxId + 1,
      comment: this.commentCtrl.value,
      createdDate: new Date().toISOString(),
      userId: 1
    })
    this.newComment.emit(this.commentCtrl.value);
    this.commentCtrl.reset()
  }

  onListItemMouseEnter(index: number) {
    this.animationStates[index] = 'active'
  }

  onListItemMouseLeave(index: number) {
    this.animationStates[index] = 'default'
  }


}