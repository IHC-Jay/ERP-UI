import { Component,   ViewChildren,  ElementRef,  ChangeDetectorRef,  QueryList, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouteConfigLoadEnd } from '@angular/router';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';

import { TpRestServiceComponent } from '../services/tprest-service.component';
import { TradingPartnersComponent } from './tradingPartners.component';
import { TradingPartner } from './TradingPartner';


@Component(
  {  selector: 'add-edit',
     templateUrl: './add-edit.TP.html',
     styleUrls: ['./add-edit.TP.css'],

    standalone: false
})


export class AddEditTP implements OnInit {
    form!: FormGroup;
    id!: string;

    isAddMode!: boolean;
    loading = false;

    submitted = false;

    tpTypes:string[] = ["Partner","Owner"];
    protocols:string[] = ["as2","sftp","https","rest","none"];

    canRender = false;

    sub:any;


    @ViewChildren("input") inputs: QueryList<ElementRef>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private tpService: TpRestServiceComponent,
        private cdRef: ChangeDetectorRef
    ) {

     }

public initializeData()
{
  console.info("1. fetchpTypes");

}

    async ngOnInit() {
      console.info("AddEditTP ngOnInit");

      const routeParams = this.route.snapshot.paramMap;
      this.id = routeParams.get('tpNm');
      if(this.id === undefined || this.id === null)
      {
        this.isAddMode = true;
        this.canRender = true;
      }
      else{
        this.isAddMode = false
        console.info('Get TP for id: ' + this.id );
      }
      let ttype ='' ;

        this.form = this.formBuilder.group({
          Name: ['', Validators.required],
          TPtype: ['', Validators.required],
          Folder: ['', Validators.required],
          CommunicationProtocol: ['', Validators.required],
          BusinessContact: [''],
          CommunicationContact: [''],
          InterchangeIdQualifier: [''],
          PartnerInterchangeIdQualifier: [''],
          Notes: [''],
          OrigName: ['']

      });


      if (!this.isAddMode) {

        this.tpService.fetchTradingPartner(this.id)
            .pipe(first())
            .subscribe(x => {
              this.form.patchValue(x);

              for (let key in x) {

                console.info(key +": " + x[key].toString());

                if(key === 'Name')
                {
                  this.form.controls['Name'].setValue(x[key].toString());
                  this.form.controls['OrigName'].setValue(x[key].toString());
                }


                else if(key === 'CommunicationContact' && x[key].toString() !== "")
                {
                  this.form.controls['CommunicationContact'].setValue(x[key].toString());
                }

                else if(key === 'BusinessContact' && x[key].toString() !== "")
                {
                  ttype =x[key].toString();

                  this.form.controls.BusinessContact.setValue(ttype);

                }
                else if(key === 'Folder')
                {
                this.form.controls.Folder.setValue(x[key].toString());

                }
                else if(key === 'InterchangeIdQualifier' && x[key].toString() !== "")
                {
                    this.form.controls.InterchangeIdQualifier.setValue(x[key].toString());
                }
                else if(key === 'PartnerInterchangeIdQualifier' && x[key].toString() !== "")
                {
                 this.form.controls.PartnerInterchangeIdQualifier.setValue(x[key].toString());
                }
                else if(key === 'TPtype')
                {
                  console.log("TPtype.setValue " + x[key].toString());
                  this.form.controls.TPtype.setValue(x[key].toString());
                }
                else if(key === 'CommunicationProtocol')
                  {
                    console.log("CommunicationProtocol.setValue " + x[key].toString());
                    this.form.controls.CommunicationProtocol.setValue(x[key].toString());
                  }

                else{
                  console.log(key +"-- Not mapped - " + this.form.controls['Name'].value)
                }
              }
             }
            );


        this.canRender = true;

      }



    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onCancel()
    {

      for (let el in this.form.controls) {

          console.log(el +': ' + this.form.controls[el].value)

      }
      this.router.navigate(["/TradingPartners/"]);
    }

    onSubmit() {

        this.submitted = true;

        for (let el in this.form.controls) {
          if (this.form.controls[el].errors) {
            console.log(el +" - not initialized")
          }
     }

        // stop here if form is invalid
        if (this.form.invalid) {
          console.info('Invalid: ' + this.form.invalid);
            return;
        }

        this.loading = true;

        this.createUpdateTradingPartner(this.isAddMode);

    }



    private createUpdateTradingPartner(addFlg: boolean) {

      console.info('Add/Update TradingPartner for: ' + this.form.value.Name);

      this.tpService.addUpdateTradingPartner(this.form.value, addFlg)
          .pipe(first())
          .subscribe((res) => {
            let retStr:String;
            if (res.errormessage !== undefined) {
             console.info('createUpdateTradingPartner error: ' + res.errormessage);
             retStr = res.errormessage;
            }
            else if( res.Status !== undefined) {
              console.error('createUpdateTradingPartner status: ' + res.Status);
              if(res.Status == 'OK')
              {
                 this.router.navigate(["/TradingPartners/" ]);
                 retStr = 'OK'
              }
              else
              {
                   retStr = this.form.value.TradingPartner + ": " + res.Status;
              }
            }
            else{
              alert('createUpdateTradingPartner Status: ' + res);
              retStr = res.Error;
            }
            if(retStr !== 'OK')
            {
              alert(retStr);
            }
              //
          })
          .add(() => this.loading = false);

    }



}
