import { Component, OnInit,Input } from '@angular/core';
import { CommonModule } from "@angular/common";
import { CommonColumns, CommonColumnsDisplayColumns} from '../CommonColumns';
import { transition } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransRestServiceComponent } from '../../services/transrest-service.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ModalErpComponent } from './modal/modal-erp.component';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.css'],
    standalone: false
})
export class TransactionDetailComponent {

  canRenderDetails: boolean = false;
  displayedColumns = [];

  dataSource = new MatTableDataSource<any>();

  sub:any;
  id:string;
  ParentId:string;
  ak1CtrlNum:string;
  ak1ver:string;
  searchStr:string;
  searchTypeString:string;
  transactionType:string;
  tradingPartner:string;
  transaction:string;
  erpData:string;
  fileName = "TEST";
  prevWindow: boolean = false;
  xmlData:string;
  stDate:string;
  endDate:string

  constructor(
    private TransactionService: TransRestServiceComponent,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  )
  {

    this.displayedColumns.push(...CommonColumnsDisplayColumns);

  }

  ngOnInit() {

    this.sub = this.route
    .queryParams
    .subscribe(params => {
      // Defaults to 0 if no query param provided.
      this.id = ''+params['id'] || '0';
      this.transaction = ''+params['transaction'] || '0';
      this.searchStr = params['search'];
      this.searchTypeString = params['searchTypeString'];
      this.transactionType = params['TransactionType'];
      this.tradingPartner = params['TradingPartner'];
      this.prevWindow = params['sameWindow'];
      this.stDate = params['stDate'];
      this.endDate = params['endDate'];

      console.log('Query params id: ', this.id + ', trans: ' + this.transaction +", search: " + this.searchStr +", searchTypeString: " + this.searchTypeString + ", Same Window: " + this.prevWindow);
    });

    this.TransactionService.fetchTransactionFields(1).subscribe((res: any) => {

      this.displayedColumns = [];

        for (var item of res)
        {

          if( ((Number.isNaN(item.TransactionCode) === false) && (item.TransactionCode ===  this.transaction) ) ||
          ( (Number.isNaN(item.TransactionCode) === true) && item.TransactionCode ===  this.transaction )
          || item.TransactionCode == 'All')
          {

            if ( ("" + item.Key).indexOf("Stream") < 0 )
            {
              this.displayedColumns.push({key: item.Key, type: item.Type, label: item.Label, transactionCode: item.TransactionCode});
              console.log(Number.isNaN(item.TransactionCode) + ", Display: " + item.TransactionCode +" ===  " + this.transaction +" || " + item.TransactionCode +": " + item.Key)
            }


          }

        }



          this.TransactionService.fetchERPtransactions("id='" + this.id +"' AND TransactionType ='" + this.transactionType + "'" , this.searchTypeString, "", 1, "").subscribe((res: any) => {


            this.dataSource.data = res;
            this.ParentId = this.dataSource.data[0].ERPDataParentId;
            this.fileName = this.dataSource.data[0].FileName.replace(/^.*[\\\/]/, '');
            this.erpData = this.dataSource.data[0].erpData

            console.log("# of records: " + res.length);
            console.log(this.transaction + '- Display columns: ' + this.displayedColumns.length);

            var staticSearchStr = " sessionId='" + this.dataSource.data[0].SessionID + "'";
            if(this.dataSource.data[0].SequenceID !== '' && this.dataSource.data[0].SequenceID !== 0  )
            {
               staticSearchStr += " AND SequenceID='" + this.dataSource.data[0].SequenceID + "'";
            }

             this.TransactionService.fetchERPtransactions(staticSearchStr, '', '', 1, '').subscribe((xmlRes: any) => {
              console.log('fetchERPtransactions: ' + xmlRes.length);
              this.xmlData = xmlRes[0].erpData;

              });

            this.canRenderDetails = true;
          });



  });

  }

  getSelectedValue(loopnum: number, question:string)
  {

    if (this.dataSource.data[0] !== undefined )
    {
      let jsonStr = JSON.stringify(this.dataSource.data[0]);


            const jsonData = JSON.parse(jsonStr)


            for(var i in jsonData)
            {
              if(i === question)
              {
                var val = jsonData[i];
                // console.info(loopnum + ". getSelectedValue: " + question +'= ' + val);
                if(question === "erpData" )
                {
                  if (val.startsWith("ISA"))
                  {
                  let letter = val.charAt(105);
                  val = val.replaceAll(letter, letter + "\n")
                  console.info("Split X12 with: " + letter);
                  }
                  else{
                    val = val.replaceAll("~", "~\n")
                  }
                  this.erpData = val;
                }

                else if( question.indexOf("DMGDateTimePeriod") > 0 || question.indexOf("DateTimePeriod") > 0)
                {
                  val = val.substring(0,4) + "-" + val.substring(4,6) + "-" + val.substring(6,8)
                }
                else if (val === '')
                {
                  val = '-';
                }

                // console.info("getSelectedValue: " + question +"= " + val);
                return val;
            }
          }
        }
        else{
          console.info('getSelectedValue: ' +loopnum + ", " + question)
        }
  }
  toTransactions()
  {

      console.log('To Transactions: ' + this.transaction + "/" + this.searchTypeString +"/"+ this.tradingPartner );
      this.router.navigate(["/transaction/"],
      // {queryParams: { trans: this.transaction, 'search':  this.searchStr } }
      {
        queryParams: { transaction: this.transaction,
          'search': this.searchStr,
          'searchTypeString': this.searchTypeString,
          'tradingPartner': this.tradingPartner,
          'stDate': this.stDate, 'endDate': this.endDate }
    }

       );
  }

  openERPModal(): void {
    console.info("openERPModal: " + this.ParentId + ", " + this.transaction);
    this.TransactionService.fetchParentRecord(this.ParentId).subscribe((res: any) => {
      this.canRenderDetails = true;
      let val = ""

      if(res === "No data")
      {
        let param: string[] = [ "Not found", ""];
        const dialogRef = this.dialog.open(ModalErpComponent, {
          width: '1700px',
          data: param
        });
        }
        else if (res.erpData !== undefined && res.erpData.length > 105 )
          {

            if (res.erpData.indexOf("\n") < 0)
            {
               let letter = res.erpData.charAt(105);

               val = res.erpData.replaceAll(letter, letter + "\n" )
                console.info("Split X12 with: " + letter);
             }
             else
              {
                  val = res.erpData
              }

          }
          else
          {
               val = res.erpData
          }

          if(val !== "")
          {
            let param: string[] = [ val, this.fileName];
            const dialogRef = this.dialog.open(ModalErpComponent, {
              width: '1700px',
              data: param
            });

            dialogRef.afterClosed().subscribe(result => {
              console.log('The dialog closed');
            });

          }
        });

      }
}
