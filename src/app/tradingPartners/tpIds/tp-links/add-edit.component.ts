import { Component,   ViewChildren,  ElementRef,  ChangeDetectorRef,  QueryList, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouteConfigLoadEnd } from '@angular/router';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { TpRestServiceComponent } from '../../../services/tprest-service.component';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import { tpLinks } from './tp-links';
import { TpId, TpIdColumns } from '../TpId';


export class TransactionTypes
{
  Name:string;
  TransactionType:string;
  Version: string;
  Direction: string;
  Type: string;
}


@Component(
  {  selector: 'add-edit',
     templateUrl: './add-edit.component.html',
     styleUrls: ['./add-edit.component.css'],
    standalone: false
})


export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id!: string;
    parentTpId!: string;
    tpType: string;
    tpName:string;
    aliasName:string;
    sendertpIdHelp: string;
    receivertpIdHelp: string;
    isAddMode: boolean = false;
    loading = false;
    batchMode: boolean = true;
    showTpIds: boolean = false;
    submitted = false;

    ackTypes:string[] = ["No","Yes"];
    direcTypes:string[];


    isaReceivingTpIds = [];
    isaSendingTpIds = [];
    gsReceivingTpIds = [];
    gsSendingTpIds = [];
    ownerTpIds = [];
    tpIdsForParent:TpId[] = [];
    canRender = false;
    transaction: string = "";
    transType: string = "";
    sub:any;

    trn: tpLinks;

    transactionTypes: TransactionTypes[];


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
  console.info("1. fetchTpIds");

  this.tpService.fetchOwnerTpIds().subscribe((res: any) => {

    res.forEach((entry) => {

     this.ownerTpIds.push(entry.TPID);

    });


  console.info("2. fetchTransactionTypes");
  this.tpService.fetchTransactionTypes().subscribe((res: any) => {

    this.transactionTypes = res;
    this.canRender = true;

    console.info('3. Get TpIds for ' + this.tpName)
    this.tpService.getTpIds(this.tpName).subscribe((res: any) => {
      this.tpIdsForParent = res;
      console.info( "# of TpIds:" + this.tpIdsForParent.length + ", TP[0] ID: " + this.tpIdsForParent[0].Name +", " + this.tpIdsForParent[0].TPID  +", " + this.tpIdsForParent[0].Type)
    });
  } );

 });
}

    async ngOnInit() {
      console.info("AddEditComponent ngOnInit");

      let arr =  this.route.snapshot.paramMap.keys

      this.route.snapshot.url.forEach(element => {
        if (element.path.indexOf("tpLink-add") >= 0)
        {
          this.isAddMode = true;
        }

      });



      this.parentTpId = this.route.snapshot.params['tpId'];
      this.tpType = this.route.snapshot.params['type'];
      this.tpName = this.route.snapshot.params['tpName'];
      this.aliasName = this.route.snapshot.params['aliasName'];

       if(!this.isAddMode)
       { //edit
          this.id = this.route.snapshot.params['tpLink'];
       }

        this.sub = this.route.queryParams
        .subscribe(params => {

          this.transaction = ''+params['transaction']
        });



        console.info('Add Link for id: ' + this.isAddMode +", parent: " + this.parentTpId + ", type: " + this.tpType + ", Name: " + this.tpName +", edit ID: " + this.id);

        this.form = this.formBuilder.group({
          ParentTpId: [''],
          Link: ['', Validators.required],
          TransactionType: ['', Validators.required],
          TransactionTypeInfo: [''],

          Direction: ['', Validators.required],
          Ack: ['', Validators.required],
          Separators: ['^|\\~', Validators.required],

          GsReceiverId: ['', Validators.required],
          GsSenderId: ['', Validators.required],
          IsaSenderId: ['', Validators.required],
          IsaReceiverId: ['', Validators.required],
          Folder: [''],
          FileName: ['%Partner_%TransactionType_%DtTm_%MsgId.xml']

      });
      this.initializeData();


      let myPromise = () => new Promise((resolve, reject) => {
        setTimeout(function(){
          resolve('Count')
        }, 1000)
      })

      for (let index = 0; index < 5; index++) {
        let count = await myPromise()
        console.log('waiting for service: ' +`${count}: ${index}`);
        if(this.canRender)
          break;
      }

      let ttype ='' ;
      console.log("TPIds: " + this.isaReceivingTpIds.length + ", " +    this.isaSendingTpIds.length);

      if (!this.isAddMode) {
        this.tpService.fetchTpLink(this.id)
            .pipe(first())
            .subscribe(x => {
              this.form.patchValue(x);

              for (let key in x) {

                // console.log("SetValue " + key +": " + x[key].toString());
                if(key === 'Ack')
                {

                  this.form.controls['Ack'].setValue(this.ackTypes[x[key].toString()]);
                }
                else if(key === 'Separators')
                {

                    let sepVal = x[key].toString()
                    if (sepVal === "")
                    {
                      sepVal = '^|\\~'
                    }

                    this.form.controls['Separators'].setValue(sepVal);
                    console.log("Separators: " + key +": " + sepVal);
                }
                else if(key === 'Folder')
                  {
                    this.form.controls['Folder'].setValue(x[key].toString());
                  }

                else if(key === 'Direction')
                {
                  this.form.controls['Direction'].setValue(x[key].toString());
                  console.log("Direction: " + x[key].toString())
                }
                else if(key === 'FileName')
                {
                    this.form.controls['FileName'].setValue(x[key].toString());
                }

                else if(key === 'TransactionType')
                {
                  ttype =x[key].toString();

                  this.form.controls.TransactionType.setValue(ttype);

                }
                else if(key === 'GsReceiverId')
                {
                  let val = x[key].toString()
                  if (val === "")
                  {
                      val = 'NA'
                  }
                  this.form.controls.GsReceiverId.setValue(val);

                }
                else if(key === 'IsaReceiverId')
                {
                    this.form.controls.IsaReceiverId.setValue(x[key].toString());
                }
                else if(key === 'GsSenderId')
                {
                  let val = x[key].toString()
                  if (val === "")
                  {
                      val = 'NA'
                  }
                 this.form.controls.GsSenderId.setValue(val);
                }
                else if(key === 'IsaSenderId')
                {
                  this.form.controls.IsaSenderId.setValue(x[key].toString());
                }

                else{
                  console.log(key +"-- Not mapped")
                }
              }
              this.setTransactionType();



             }
            );

        this.form.controls.ParentTpId.setValue(this.parentTpId);

      }
      else{
        if (this.transaction === undefined || this.transaction === "")
          {
              console.info('Transaction type not selected');
          }
        else {

          // Search
          console.info('setTransactionType search: ' + this.transaction + ', ' + this.transactionTypes.length);

          var result = this.transactionTypes.findIndex(item => item.TransactionType  === this.transaction);
          console.info(this.transaction + '- findIndex result: ' + result );
          if( result >= 0 )
          {
            this.form.controls.TransactionType.setValue(this.transactionTypes[result].TransactionType);
            console.log("Set transaction type: " + this.transactionTypes[result].TransactionType +' , input: ' + this.transaction)

            this.setTransactionType();
          }
        }
      }


    }
/*
    ngAfterViewInit()
    {
      console.info('nfAfter: ' + this.form.controls['Link'].value)
    }
*/
    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onCancel()
    {
      console.info('On Cancel, got back to: ' + this.parentTpId);
      for (let el in this.form.controls) {
        if (this.form.controls[el].value) {
          console.log(el +': ' + this.form.controls[el].value)
        }
      }
      this.router.navigate(["/TradingPartners/tpIds/tp-links/" + this.parentTpId, this.tpType, this.tpName, this.aliasName ]);

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

        this.createUpdateTpLink(this.isAddMode);

    }


    setTransactionType()
    {

      this.direcTypes =["In", "Out"];
      var ttVal = this.form.controls['TransactionType'].value
      console.info('setTransactionType search: ' + ttVal + ', ' + this.transactionTypes.length);
       var result = this.transactionTypes.findIndex(item => item.TransactionType === ttVal);
       console.info(ttVal + '- result: ' + result);
       this.transType = this.transactionTypes[result].Type



       if (this.transType === 'X12')
       {
          this.showTpIds = true;
       }
       else
       {
          this.showTpIds = false;
       }


      this.form.controls.TransactionTypeInfo.setValue(this.transactionTypes[result].TransactionType +", " + this.transType +", " + this.transactionTypes[result].Version);
      console.info('TransactionTypeInfo : ' +this.form.controls['TransactionTypeInfo'].value +", this.isAddMode: " + this.isAddMode);

      if(this.isAddMode) // Set direction for Add mode, not Edit
      {
        if(this.transactionTypes[result].Direction === 'IO')
        {
          this.form.controls.Direction.setValue(this.direcTypes[1]);
          this.form.controls.Direction.enable();
        }
        else
        {
          console.info('Set direction from Transaction type: ' + this.transactionTypes[result].Direction);
          let index = this.direcTypes.indexOf(this.transactionTypes[result].Direction)
          this.direcTypes.splice((index>0)?0:1, 1);
          this.form.controls.Direction.setValue(this.transactionTypes[result].Direction);

          if( this.form.controls['Direction'].value === 'In')
          {
            this.form.controls.FileName.setValue('%Partner_%TransactionType_%DtTm_%MsgId.xml');
          }
          else
          {
            this.form.controls.FileName.setValue('%Partner_%TransactionType_%DtTm_%MsgId.txt');
          }


          // this.form.controls.Direction.disable();

        }
        this.form.controls.Ack.setValue('No')
        this.form.controls.Separators.setValue('^|\\~')
    }

      //

      this.setDirection();



    }

    setDirection()
    {
      console.info('Set Direction, ' + this.form.controls['Direction'].value + ', ID:' + this.parentTpId + ", TP type: " + this.tpType)
      if( this.form.controls['Direction'].value === 'In')
        {
          this.sendertpIdHelp = 'Parent TPId';
          this.receivertpIdHelp = 'TPIds for owner';
          this.isaSendingTpIds =[];
          this.isaReceivingTpIds=[];
          this.gsSendingTpIds =[];
          this.gsReceivingTpIds=[];


          if(this.tpType === "BOTH")
          {
            this.isaSendingTpIds[0] = this.parentTpId ;
            this.isaReceivingTpIds = this.ownerTpIds;

            this.gsReceivingTpIds = this.ownerTpIds;
            this.gsSendingTpIds[0] = this.parentTpId ;
             console.info('BOTH: ' + this.ownerTpIds.length + ", " +this.parentTpId.length);
          }
          else if(this.tpType === "GS")
          {
            this.gsSendingTpIds[0] = this.parentTpId ;
            this.gsReceivingTpIds = this.ownerTpIds;
            this.isaReceivingTpIds = this.ownerTpIds;

            this.tpIdsForParent.forEach(element => {

              // console.info(element.Name +", " + element.TPID  +", " + element.Type);
              if (element.Type != "GS")
              {
                this.isaSendingTpIds.push(element.TPID)
              }
            });

          }
          else // ISA
            {
              this.isaSendingTpIds[0] = this.parentTpId ;
              this.isaReceivingTpIds = this.ownerTpIds;
              this.gsReceivingTpIds = this.ownerTpIds;

              this.tpIdsForParent.forEach(element => {


                if (element.Type != "ISA")
                {
                  this.gsSendingTpIds.push(element.TPID)
                }
              });

            }

          if (this.isAddMode) {
            console.info("Set IDs")
            this.form.controls.GsReceiverId.setValue(this.gsReceivingTpIds[0]);
            this.form.controls.IsaReceiverId.setValue(this.isaReceivingTpIds[0]);
            this.form.controls.GsSenderId.setValue(this.gsSendingTpIds[0]);
            this.form.controls.IsaSenderId.setValue(this.isaSendingTpIds[0]);
            if(this.transType !== 'X12')
            {
              this.form.controls.GsReceiverId.setValue('NA');
              this.form.controls.GsSenderId.setValue('NA');
            }
          }
        }
        else { // Out
          this.sendertpIdHelp = 'TPIds for owner';
          this.receivertpIdHelp = 'Parent TPId';

          this.isaSendingTpIds =[];
          this.isaReceivingTpIds=[];
          this.gsSendingTpIds =[];
          this.gsReceivingTpIds=[];


          if(this.tpType === "BOTH")
            {
              this.isaReceivingTpIds[0] = this.parentTpId ;
              this.isaSendingTpIds = this.ownerTpIds;

              this.gsSendingTpIds = this.ownerTpIds;
              this.gsReceivingTpIds[0] = this.parentTpId ;
            }
            else if(this.tpType === "GS")
            {
              this.gsReceivingTpIds[0] = this.parentTpId ;
              this.gsSendingTpIds = this.ownerTpIds;

              this.isaSendingTpIds = this.ownerTpIds;

              this.tpIdsForParent.forEach(element => {


                if (element.Type != "GS")
                {
                  this.isaReceivingTpIds.push(element.TPID)
                }
              });

            }
            else // ISA
              {
                this.isaReceivingTpIds[0] = this.parentTpId ;
                this.isaSendingTpIds = this.ownerTpIds;

                this.gsSendingTpIds = this.ownerTpIds;

                this.tpIdsForParent.forEach(element => {


                  if (element.Type != "ISA")
                  {
                    this.gsReceivingTpIds.push(element.TPID)
                  }
                });

              }
          if (this.isAddMode) {
            this.form.controls.GsReceiverId.setValue(this.gsReceivingTpIds[0]);
            this.form.controls.IsaReceiverId.setValue(this.isaReceivingTpIds[0]);
            this.form.controls.GsSenderId.setValue(this.gsSendingTpIds[0]);
            this.form.controls.IsaSenderId.setValue(this.isaSendingTpIds[0]);
            }
        }
    }

    private createUpdateTpLink(addFlg: boolean) {

      console.info('Create TPLink for name: ' + this.form.value.TransactionType);

      this.tpService.addUpdateTpLink(this.form.value, addFlg)
          .pipe(first())
          .subscribe((res) => {
            let retStr:String;
            if (res.errormessage !== undefined) {
             console.info('createUpdateTpLink error: ' + res.errormessage);
             retStr = res.errormessage;
            }
            else if( res.Status !== undefined) {
              console.error('createUpdateTpLink status: ' + res.Status);
              if(res.Status == 'OK')
              {
                 this.router.navigate(["/TradingPartners/tpIds/tp-links/" + this.parentTpId, this.tpType, this.tpName, this.aliasName ]);
                 retStr = 'OK'
              }
              else
              {
                   retStr = this.form.value.Link + ": " + res.Status;
              }
            }
            else{
              alert('createUpdateTpLink Status: ' + res);
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
