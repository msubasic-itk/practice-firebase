import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { logging } from 'protractor';
import { Observable, Subscription } from 'rxjs';
import { AuthService, SignupResponse } from '../recipes/auth.service';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy{

  isLoggedin = true;
  isFatching = false;
  errorMessage: string;
  @ViewChild(PlaceholderDirective, {static: false}) alertHosting: PlaceholderDirective; 

  private closeSub: Subscription;

  constructor(private authHttp: AuthService, private componentFactoryResolver: ComponentFactoryResolver ){}
  onSwitch() {
    this.isLoggedin = !this.isLoggedin;
  }

  onSubmit(form: NgForm) {
    this.isFatching = true;
    const email = form.value.email;
    const password = form.value.password;

    let authObs: Observable<SignupResponse>;

    if (this.isLoggedin) {
      console.log('opalio login');
      authObs = this.authHttp.login(email, password);
    } else {
      if (!form.valid){
      } else {
        console.log('opalio signup');
        authObs = this.authHttp.signUp(email, password);
      }
    }
    authObs.subscribe(response => {
      this.isFatching = false;
      console.log(response)}, 
      error => {
        this.isFatching = false;
        this.errorMessage = error;
        this.errorHandler(error);
        console.log(error)});
  }

  private errorHandler(error){
    const alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);    
    const hostViewContainerRef = this.alertHosting.viewContainerRef;
    hostViewContainerRef.clear();
    const component = hostViewContainerRef.createComponent(alertComponentFactory);
    component.instance.message = error;
    this.closeSub = component.instance.closeIt.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    })

  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

}
