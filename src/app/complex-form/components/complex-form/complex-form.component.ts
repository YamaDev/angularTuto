import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {map, Observable, startWith, tap} from "rxjs";
import {ComplexFormService} from "../../services/complex-form.service";
import {confirmEqualValidator} from "../../validators/confirm-equal.validator";

@Component({
  selector: 'app-complex-form',
  templateUrl: './complex-form.component.html',
  styleUrls: ['./complex-form.component.scss']
})

export class ComplexFormComponent implements OnInit {

  loading = false;
  mainForm!: FormGroup;
  personalInfoFrom!: FormGroup;
  contactPreferenceCtrl!: FormControl;
  emailForm!: FormGroup;
  emailCtrl!: FormControl;
  confirmEmailCtrl!: FormControl;
  phoneCtrl!: FormControl;
  loginInfoForm!: FormGroup;
  passwordCtrl!: FormControl;
  confirmPasswordCtrl!: FormControl;

  showEmailCtrl$!: Observable<boolean>;
  showPhoneCtrl$!: Observable<boolean>;
  showEmailError$!: Observable<boolean>;
  showPasswordError$!: Observable<boolean>;

  constructor(private formBuilder: FormBuilder,
              private complexFormService: ComplexFormService) {
  }

  ngOnInit(): void {
    this.initFormControls()
    this.initMainForm();
    this.initFormObservables();
  }

  private initMainForm(): void {
    this.mainForm = this.formBuilder.group({
      personalInfo: this.personalInfoFrom,
      contactPreference: this.contactPreferenceCtrl,
      email: this.emailForm,
      phone: this.phoneCtrl,
      loginInfo: this.loginInfoForm
    });
  }


  private initFormControls() {
    this.personalInfoFrom = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });
    this.contactPreferenceCtrl = this.formBuilder.control('email');
    this.emailCtrl = this.formBuilder.control('');
    this.confirmEmailCtrl = this.formBuilder.control('');
    this.emailForm = this.formBuilder.group({
      email: this.emailCtrl,
      confirm: this.confirmEmailCtrl
    }, {
      validators: [confirmEqualValidator('email', 'confirm')],
      updateOn: 'blur'
    })
    this.phoneCtrl = this.formBuilder.control('');
    this.passwordCtrl = this.formBuilder.control('', Validators.required);
    this.confirmPasswordCtrl = this.formBuilder.control('', Validators.required);
    this.loginInfoForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: this.passwordCtrl,
      confirmPassword: this.confirmPasswordCtrl
    }, {
      validators: [confirmEqualValidator('password', 'confirmPassword')],
      updateOn: 'blur'
    })
  }

  private initFormObservables() {
    this.showEmailCtrl$ = this.contactPreferenceCtrl.valueChanges.pipe(
      startWith(this.contactPreferenceCtrl.value),
      map(preference => preference === 'email'),
      tap(showEmailCtrl => this.setEmailCtrl(showEmailCtrl))
    );
    this.showPhoneCtrl$ = this.contactPreferenceCtrl.valueChanges.pipe(
      startWith(this.contactPreferenceCtrl.value),
      map(preference => preference === 'phone'),
      tap(showPhoneCtrl => this.setPhoneCtrl(showPhoneCtrl))
    );
    this.showEmailError$ = this.emailForm.statusChanges.pipe(
      map(status => status === 'INVALID' && this.emailCtrl.value && this.confirmEmailCtrl.value)
    );
    this.showPasswordError$ = this.loginInfoForm.statusChanges.pipe(
      map(status =>
        status === 'INVALID' &&
        this.passwordCtrl.value &&
        this.confirmPasswordCtrl.value &&
        this.loginInfoForm.hasError('confirmEqual')
      )
    );
  }

  private setEmailCtrl(showEmailCtrl: boolean) {
    if (showEmailCtrl) {
      this.emailCtrl.addValidators([
        Validators.required,
        Validators.email]);
      this.confirmEmailCtrl.addValidators([
        Validators.required,
        Validators.email
      ]);
    } else {
      this.emailCtrl.clearValidators();
      this.confirmEmailCtrl.clearValidators();
    }
    this.emailCtrl.updateValueAndValidity();
    this.confirmEmailCtrl.updateValueAndValidity();
  }

  private setPhoneCtrl(showPhoneCtrl: boolean) {
    if (showPhoneCtrl) {
      this.phoneCtrl.addValidators([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10)
      ]);
    } else {
      this.phoneCtrl.clearValidators();
    }
  }

  onSubmitForm() {
    this.loading = true;
    this.complexFormService.saveUserInfo(this.mainForm.value).pipe(
      tap(saved => {
        this.loading = false;
        if (saved) {
          this.resetRorm();
        } else {
          console.error('Echec de l\'enregistrement');
        }
      })
    ).subscribe()
  }

  private resetRorm() {
    this.mainForm.reset();
    this.contactPreferenceCtrl.patchValue('email');
  }

  getFormControlErrorText(ctrl: AbstractControl) {
    if (ctrl.hasError('required')) {
      return 'Ce champ est requis';
    } else if (ctrl.hasError('email')) {
      return 'Merci d\'entrer une adresse mail valide'
    } else if (ctrl.hasError('minlength')) {
      return 'ce numero ne contient pas assez de chiffres'
    } else if (ctrl.hasError('maxlength')) {
      return 'ce numero ontient trop de chiffres'
    } else {
      return 'Ce champ contient une erreur';
    }
  }

}
