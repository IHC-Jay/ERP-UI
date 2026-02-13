import { Component, EventEmitter, OnInit, Output, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';
import {TransRestServiceComponent} from '../services/transrest-service.component';
import {User} from '../login/user';
import {DisplayColumns, DisplayColumnsArray} from '../transaction/DisplayColumns';


import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
    standalone: false
})

export class HeaderComponent implements AfterViewInit, OnInit   {
  loginForm: FormGroup;

  loading = false;
  submitted = false;
  returnUrl: string;
  displayHelp: string = "Username/Password will used for calling IRIS REST services";
  error = '';
  firstPage = '/TradingPartners';
  transaction = "";
  id = "";
  tpId = "";
  paramsObject:any;
  currentUser: User;

  isLogin:boolean;
  collapsed = true;
  @Output() selectedFeature = new EventEmitter<string>();
  @ViewChild("username") focusField: ElementRef;

  selectedMenu:string = 'tradingPartner'
  links = [
    {name:'Trading Partners', link:"/TradingPartners"},
    {name:'Search ERP TPID', link:"/search"},
    {name:'X12 Transactions', link:"/transaction"},
    {name:'HL7 Messages', link:"/hl7"}
  ];

  activeLink = this.links[0].link;
  background = 'white';

  constructor(private router: Router, private authenticationService: AuthenticationService,
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private TransactionService: TransRestServiceComponent
    )
    {
      this.authenticationService.currentUser.subscribe(x => {
        this.currentUser = x
        this.isLogin = (x != null);
        if (this.currentUser != null)
        {
          console.log("HeaderComponent: " + this.currentUser.username)
        }
        else
        {
          this.router.navigate(['/']);
        }
        }
        );
    }

    ngOnInit() {

      this.loginForm = this.formBuilder.group({
          username: ['', Validators.required],
          password: ['', Validators.required],
          env: ['DEV', Validators.required]
      });


      // get return url from route parameters or default to '/'
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';

      this.route.queryParams
      .subscribe(params => {
        this.paramsObject = { ...params.keys, ...params };

        if(params !== undefined && params.page !== undefined)
        {
          console.log("params: " + params);
          this.firstPage = params.page;
          this.transaction = params.transaction;
          if (this.firstPage.includes("transaction-details") )
          {
            this.id = params.id;
          }
          else if (this.firstPage.includes("tp-add"))
          {
            this.tpId = params.tpId;
          }

          console.log("Open" + this.firstPage +" with " + this.transaction);
          this.onLogin();
        }
        else
        {
          console.log("No params for returnUrl")
        }
      }
    );
      // console.log('HeaderComponent ngOnInit: ' + this.firstPage)
  }

  ngAfterViewInit() {
    if(this.focusField !== undefined && this.focusField.nativeElement !== undefined)
      this.focusField.nativeElement.focus();
  }


     // convenience getter for easy access to form fields
     get f() { return this.loginForm.controls; }


  routeLnk(lnk: string): void{
    console.info('route: ' + lnk);

    this.router.navigate([lnk] );
    this.background = (this.background =='white') ? 'beige' : 'white';
    this.activeLink = lnk
    console.info(lnk +": " + this.background);
  }

  logout() {
     this.isLogin = false;
    this.returnUrl = ""
    this.firstPage = "/";

    this.authenticationService.logout();
    sessionStorage.clear();

    this.f.username.setValue('');
    this.f.password.setValue('');
    this.router.navigate(['/']);
    location.reload();
   }

   onLogin()
   {


      // stop here if form is invalid
      if (this.loginForm.invalid) {
        console.error("Invalid login form");
          return;
      }

      this.loading = true;
      return this.authenticationService.login(this.f.username.value, this.f.password.value, this.f.env.value)
      .subscribe({
        next: (res) =>
        {
          console.info('from  authenticationService.login : ' + this.firstPage);
          console.info(this.f.env.value + '- OK: ' + this.returnUrl);

          if (this.firstPage.includes("transaction-details") )
          {
            console.log("navigate: /transaction/transaction-details/ -" + this.id);
            this.router.navigate(["/transaction/transaction-details/"],
            {queryParams: { id:  this.id, 'transaction': this.transaction, 'search': ''} }
            );
          }
          else if (this.firstPage.includes("tp-add"))
          {
            console.log("navigate: /TradingPartners/tpIds/tp-links/tpLink-add -" + this.id);
            this.router.navigate(["/TradingPartners/tpIds/tp-links/tpLink-add/"+this.tpId ],
            {queryParams: { 'transaction': this.transaction} }
            );
          }
          else{
            this.router.navigate([this.firstPage]);
          }

          var dispCol = <DisplayColumnsArray>{};
          this.TransactionService.deleteDisplayColumns(dispCol).subscribe((res: any) => {

            console.info("deleteDisplayColumns: " + res);
          });



          this.isLogin = true;
          this.submitted = true;
          return;
        },
        error: (e) => {
          console.error('onLogin catchError: ' +e);
          this.router.navigate(['/']);
          alert('Login failed for ' + this.f.username.value + ". Exception in calling the REST service: " + e)
          this.displayHelp = "Login failed";
          this.loading = false;
          return;
        }
      })


   }
   onHome()
   {
    this.router.navigate(["/"]);
   }

}




