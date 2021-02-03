// AIzaSyAadgIu699RXVKLI_DtbJDMXm1pDI9GHDM

import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "../auth/user.model";

export interface SignupResponse {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean

}

@Injectable ({providedIn: 'root'})

export class AuthService {

    user = new BehaviorSubject<User>(null);
    private timeoutVariable: any;

    constructor(private http: HttpClient, private router: Router){}

    signUp(email, password){
        return this.http.post<SignupResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAadgIu699RXVKLI_DtbJDMXm1pDI9GHDM', {
            email: email,
            password: password,
            returnSecureToken: true
        })
        .pipe(catchError(this.errorHandling), tap(resData => {
            this.authenticationHandling(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
        }))
    }

    login(email, password){
        return this.http.post<SignupResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAadgIu699RXVKLI_DtbJDMXm1pDI9GHDM', {
            email: email,
            password: password,
            returnSecureToken: true
        })
        .pipe(catchError(this.errorHandling), tap(resData => {
            this.authenticationHandling(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
        }));
    }

    autoLogin() {
        const savedUser = JSON.parse(localStorage.getItem('auth'));

        if (!savedUser) {
            return;
        }

        const userClass = new User(savedUser.email, savedUser.id, savedUser._token, new Date(savedUser._tokenExpirationDate));

        if (userClass.token) {
            this.user.next(userClass);
            const expirationDuration = new Date(savedUser._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }


    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('auth');
        if( this.timeoutVariable) {
            clearTimeout(this.timeoutVariable);
        }
        this.timeoutVariable = null;
      }

    autoLogout(expiresIn: number) {
        this.timeoutVariable = setTimeout(() => this.logout(), expiresIn);
    }

    private authenticationHandling(email: string, localId: string, idToken: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(
            email,
            localId,
            idToken,
            expirationDate
        );
            this.user.next(user);
            this.router.navigate(['/recipes']);
            localStorage.setItem('auth', JSON.stringify(user));
            if (user) {
                this.autoLogout(expiresIn*1000);
                console.log(expiresIn*1000);
            }
    }

    private errorHandling(errorResponse: HttpErrorResponse) {
        let errorMessage = 'Uknown message man';
            if (!errorResponse.error || ! errorResponse.error.error) {
                return throwError(errorMessage);
            }
            switch (errorResponse.error.error.message) {
                case 'EMAIL_NOT_FOUND': errorMessage = 'This email IS NON EXISTANT MAN';
                break;
                case 'INVALID_PASSWORD': errorMessage = 'Man, are you sure this is your account?';
                break;
                case 'USER_DISABLED': errorMessage = 'This user is disabled';
                break;
              }
            return throwError(errorMessage);
    }
}

