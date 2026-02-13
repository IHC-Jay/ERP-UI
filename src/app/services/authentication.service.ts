import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

import { User } from "../login/user";
import {TpRestServiceComponent} from './tprest-service.component';
import {TransRestServiceComponent} from './transrest-service.component';
import { environment } from "../../environments/environment";


@Injectable({ providedIn: "root" })

export class AuthenticationService {
 private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private tpService: TpRestServiceComponent, private tpTransService: TransRestServiceComponent,
              private usrTransService: TransRestServiceComponent
    ) {

    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(sessionStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();

    console.info('In AuthenticationService constructor ' );
    this.currentUser.forEach(user =>
    {
      if(user !== null)
        {
          console.info('Set User: ' + user.username);
          console.info('Env ' + sessionStorage.getItem("env"));
          this.tpTransService.setcurrentUser(user.username, sessionStorage.getItem("env"), this);
        }
        else{
          console.info('User object not initialized');
        }
    });

  }

  public get currentUserValue(): User {

    return this.currentUserSubject.value;
  }

  getUserName(): string
  {
    let usrNm = ""
    this.currentUser.forEach(user =>
      {
        console.info('AuthenticationService getUserName ' + user.username);
        usrNm = user.username
      });
      if (usrNm == '')
      {

        usrNm = sessionStorage.getItem("currentUser")
        console.info('sessionStorage.getItem: ' + usrNm);
      }
    return usrNm
  }

  login(username: string, password: string, env: string) {

      return this.tpService.validateUser(username, password, env, this).pipe(map(res => {
        console.info(' AuthenticationService login validateUser: ' + res + " in " + env);
        let user = new User();
        user.authdata = window.btoa(username + ":" + password);
        user.id = 1
        user.environment = `${environment.envName}`;
        user.username = username
        user.password = password
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        sessionStorage.setItem("env", user.environment);

        this.currentUserSubject.next(user);
        if (this.currentUserSubject.value!== null)
        {
          console.info('login currentUserValue: ' + this.currentUser );
          this.tpTransService.setcurrentUser(username, env, this);

        }
        return user;
      }
      )

      );

  }

  logout() {
    // remove user from local storage to log user out
    console.info('logout currentUserValue: ' + (this.currentUserSubject.value.username));
    sessionStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
  }

}
