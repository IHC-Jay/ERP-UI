import { Component, OnInit,Input } from '@angular/core';
import { CommonModule } from "@angular/common";
import { CommonColumns, CommonColumnsDisplayColumns} from '../CommonColumns';
import { transition } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransRestServiceComponent } from '../../services/transrest-service.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogRef } from '@angular/cdk/dialog';
import { Console } from 'console';


@Component({
  selector: 'app-hl7-details',
  templateUrl: './hl7-details.component.html',
  styleUrls: ['./hl7-details.component.css'],
    standalone: false
})
export class Hl7DetailComponent {

  canRenderDetails: boolean = false;
  displayedColumns = [];

  dataSource = new MatTableDataSource<any>();

  sub:any;
  id:string;

  xmlData:string;
  searchStr:string;
  stDate:string;
  endDate:string
  searchTypeString:string;

  MessageType:string;

  hl7Data:string;
  fileName = "TEST";
  prevWindow: boolean = false;

  constructor(
    private TransactionService: TransRestServiceComponent,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  )
  {
    this.canRenderDetails = false;
  }

  ngOnInit() {

    this.sub = this.route
    .queryParams
    .subscribe(params => {
      // Defaults to 0 if no query param provided.
      this.id = ''+params['id'] || '0';

      this.searchStr = params['search'];
      this.stDate = params['stDate'];
      this.endDate = params['endDate'];

      this.searchTypeString = params['searchTypeString'];

      this.MessageType = params['MessageType'];
      this.prevWindow = params['sameWindow'];

      console.log('Query params id: ', this.id  +", search: " + this.MessageType +", Date: " + this.stDate + ", Same Window: " + this.prevWindow);
    });


          this.displayedColumns.push(...CommonColumnsDisplayColumns);


          this.TransactionService.fetchHL7Messages("id='" + this.id +"'", this.searchTypeString, 1).subscribe((res: any) => {


            this.dataSource.data = res;

            this.hl7Data = this.dataSource.data[0].hl7Data.replaceAll('###', '\n');

            console.log("# of records: " + res.length);

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

  }

  getSelectedValue(loopnum: number, question:string)
  {

    if (this.dataSource.data[0] !== undefined )
    {


      let jsonStr = JSON.stringify(this.dataSource.data[0]);

            const jsonData = JSON.parse(jsonStr)

            // console.info("getSelectedValue - JSON Data: " + jsonStr);

            for(var i in jsonData)
            {

              if(i === question)
              {
                var val = jsonData[i];


                 if( question.indexOf("DateTime") > 0 )
                {
                  val = val.substring(0,4) + "-" + val.substring(4,6) + "-" + val.substring(6,8)
                }
                else if (val === '')
                {
                  val = '-';
                }

                console.info("getSelectedValue: " + question +"= " + val);
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

      console.log('To HL7: '  + this.searchTypeString +"/"+ this.MessageType );
      this.router.navigate(["/hl7/"],

      {
        queryParams: {

        'search': this.searchStr, 'searchTypeString': this.searchTypeString,
        'stDate': this.stDate, 'endDate': this.endDate,
        'MessageType':this.MessageType

        }
    }

       );
  }

}
