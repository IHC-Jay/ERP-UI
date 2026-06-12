import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, pipe } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { formatDate } from '@angular/common';
import { LOCALE_ID, NgModule } from '@angular/core';
import { environment } from '../../environments/environment';

import { Inject } from "@angular/core";

import {DisplayColumns, DisplayColumnsArray} from '../transaction/DisplayColumns';

import { Router, ActivatedRoute} from '@angular/router';
import {User} from '../login/user';
import { AuthenticationService } from './authentication.service';


@Injectable({ providedIn: 'root' })

@Component({
  selector: 'app-rest-service',
  templateUrl: './rest-service.component.html',
    standalone: false
})

export class TransRestServiceComponent {

   rtTransUrl = `${environment.transUrl}`;

  error = new Subject<string>();
  currentUser: string = "";
  env: string = "";
  authenticationService: AuthenticationService;

  constructor(private http: HttpClient, private http2: HttpClient
    , private router: Router, @Inject(LOCALE_ID) public locale: string)
   {
     console.log('**** TransRestServiceComponent RestServiceComponent constructor ****');
     this.rtTransUrl = `${environment.transUrl}` ;
   }

 // Transactions REST

setcurrentUser(currentUser : string, env: string, authService: AuthenticationService)
{
  console.log( env + ', setcurrentUser: ' + currentUser);
  this.currentUser = currentUser;
  this.env = env;
  this.authenticationService = authService;

  if( env == 'QA')
    {
      this.rtTransUrl = `${environment.transUrl}` ;
    }
    else
    {
      this.rtTransUrl = `${environment.transUrl}`;
    }

}


getCurrentUser()
{
  console.log('Fetch getCurrentUser from authenticationService ')

     if( this.currentUser === '')
     {
      this.currentUser = this.authenticationService.getUserName()
     }
     if (this.currentUser == '')
      {

        console.log('** ERROR SET MY NAME **')
      }
     console.log('Return getCurrentUser: ' + this.currentUser);

}

fetchERPtransactions(searchStr: string, searchType: string, isaOrSt: string, maxCnt : Number, partnerName: string) {
  console.log( this.env + ' - Fetch fetchERPtransactions with Auth for: ' + searchStr +", " + searchType +", for " + partnerName);

  let url = this.createRestUrl('EDI', searchStr, searchType, maxCnt, partnerName, isaOrSt);

  console.log('ERP transactions URL: ' + url)
  return this.http2
    .get<{ [key: string]: any }>(
      url
    )

    .pipe(
      map(responseData => {
        console.info(responseData);

        const ERPRequestArray: any[] = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
             ERPRequestArray.push({ ...responseData[key], id: responseData[key].id });
          }
        }
        console.info('return TP array: ' + ERPRequestArray.length );
        return ERPRequestArray;


      }),

      catchError(errorRes => {
        // Send to analytics server
        console.error('In fetchERPRequest catchError: ' + errorRes);
        return errorRes;
      })
    );

}

fetchParentRecord(id: string) {


  let url = this.rtTransUrl + "GetParentX12?id=" + id;

  console.log('Fetch Parent X12 ' + url);
  return this.http2
  .get<{ [key: string]: any }>(
    url
  ).pipe(
      map(responseData => {
        console.info("responseData: " + responseData);

        if(responseData !== undefined && responseData[0] !== undefined)
        {

          console.info('return Parent X12 : ' + responseData[0].id );
          return responseData[0];
        }
        else
        {
          console.info('No data from service');
          return "No data";
        }

      }),

      catchError(errorRes => {
        // Send to analytics server
        console.error('In fetchParentRecord catchError: ' + errorRes);
        return errorRes;
      })
    );

}


fetchTransactionTypes() {
  console.log('Fetch TransactionTypes with Auth ' );

  let url = this.rtTransUrl + 'TransactionTypes';


  return this.http2
    .get<{ [key: string]: any }>(
      url
    )

    .pipe(
      map(responseData => {
        console.info(responseData);

        return responseData;

      }),

      catchError(errorRes => {
        // Send to analytics server
        console.error('In fetchTransactionTypess catchError: ' + errorRes);
        return errorRes;
      })
    );

}

fetchTransactionFields(all) {
  console.log('Fetch TransactionFields  ' + all);

  let url = this.rtTransUrl + "TransactionFields?allFlds=" + all;


  return this.http2
    .get<{ [key: string]: any }>(
      url
    )

    .pipe(
      map(responseData => {
        console.info(responseData);

        return responseData;

      }),

      catchError(errorRes => {
        // Send to analytics server
        console.error('In fetchTransactionFields catchError: ' + errorRes);
        return errorRes;
      })
    );

}



fetchDisplayColumns() {

  if(this.currentUser === '')
    {
      this.getCurrentUser()
    }

  let url = this.rtTransUrl + 'DisplayColumns?userNm=' +  this.currentUser;

  console.log('Fetch DisplayColumns from  ' + url);
  return this.http2
    .get<{ [key: string]: DisplayColumns }>(
      url
    )

    .pipe(
      map(responseData => {
        console.info(responseData);

        const dispArray: DisplayColumns[] = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
            dispArray.push({ ...responseData[key], id: responseData[key].id });
          }
        }
        console.info('return Display array: ' + dispArray.length );
        return dispArray;


      }),

      catchError(errorRes => {
        // Send to analytics server
        console.error('In fetchDisplayColumns catchError: ' + errorRes);
        return errorRes;
      })
    );

}

fetchSearchColumns() {

  if(this.currentUser === '')
    {
      this.getCurrentUser()
    }

  let url = this.rtTransUrl + 'SearchColumns?userNm=' +  this.currentUser;

  console.log('Fetch SearchColumns from  ' + url);
  return this.http2
    .get<{ [key: string]: any }>(
      url
    )

    .pipe(
      map(responseData => {
        console.info(responseData);

        const srchArray: any[] = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
            srchArray.push({ ...responseData[key], id: responseData[key].id });
          }
        }
        if (srchArray.length > 0) {
          return srchArray;
        }
        return Array.isArray(responseData) ? responseData : [];

      }),

      catchError(errorRes => {
        // Send to analytics server
        console.error('In fetchSearchColumns catchError: ' + errorRes);
        return errorRes;
      })
    );

}

saveDisplayColumns(dispCol: DisplayColumnsArray)
{
  dispCol.User =  this.currentUser;
  console.log('saveDisplayColumns ' +  this.currentUser);

  let url = this.rtTransUrl  + 'SaveDisplayColumns';

  console.info('Post to SaveDisplayColumns: ' + url +" for " + dispCol.User);

  return this.http.post<any>(url, dispCol)
  .pipe(
    map(responseData => {
      console.info(responseData);

      return responseData;

    }),
    catchError(errorRes => {
      // Send to analytics server
      console.error('saveDisplayColumns catchError: ' + errorRes);
      return errorRes;
    })
  );

}

deleteDisplayColumns(dispCol: DisplayColumnsArray)
{
  dispCol.User =  this.currentUser;
  console.log('deleteDisplayColumns ' +  this.currentUser);

  let url = this.rtTransUrl  + 'DeleteDisplayColumns';

  console.info('Post to DeleteDisplayColumns: ' + url +" for " + dispCol.User);

  return this.http.post<any>(url, dispCol)
  .pipe(
    map(responseData => {
      console.info(responseData);

      return responseData;

    }),
    catchError(errorRes => {
      // Send to analytics server
      console.error('deleteDisplayColumns catchError: ' + errorRes);
      return errorRes;
    })
  );

}


fetchHL7Messages(searchStr: string, searchType: string,  maxCnt : Number) {
  console.log( this.env + ' - Fetch fetchHL7Messages with Auth for: ' + searchStr +", " + searchType );

  let url = this.createRestUrl('HL7', searchStr, searchType, maxCnt, '', '');

  console.log('HL7 URL: ' + url)
  return this.http2
    .get<{ [key: string]: any }>(
      url
    )

    .pipe(
      map(responseData => {
        console.info(responseData);

        const ERPRequestArray: any[] = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
             ERPRequestArray.push({ ...responseData[key], id: responseData[key].id });
          }
        }
        console.info('return TP array: ' + ERPRequestArray.length );
        return ERPRequestArray;


      }),

      catchError(errorRes => {
        // Send to analytics server
        console.error('In fetchHL7Messages catchError: ' + errorRes);
        return errorRes;
      })
    );

}


createRestUrl(tranType: string, searchStr: string, searchType: string, maxCnt : Number, partnerName: string, isaOrSt: string)
{


  let dtTm = "";

  console.log('createRestUrl ' + tranType + ',  searchType: ' + searchType + ", searchStr: " + searchStr + ", return: " + maxCnt);

  let url = this.rtTransUrl + tranType;



  if(searchStr.indexOf("id=") >= 0)
  {
    url = url + "?searchStr=" + searchStr +"&count=1"
  }
  else{

    if (searchType !== "")
    {
      let dtTm = ""
      if (searchType.indexOf("between") < 0)
      {
        dtTm = "ProcessDtTm >= '" + formatDate(searchType, 'yyyy-MM-dd',this.locale) +"'";
      }
      else{
        dtTm = searchType
      }

      if(searchStr.length > 0)
      {
        url = url + "?searchStr=" + searchStr + " and " + dtTm + "&count=" + maxCnt;
      }
      else
      {
        url = url + "?searchStr= " + dtTm +"&count=" + maxCnt
      }
    }
    else{
      url = url + "?searchStr="+ searchStr +"&count=" + maxCnt
    }

  }
  if(partnerName !== "")
  {
      url = url + "&partner=" + partnerName
  }
  else
  {
    url = url + "&partner="
  }

  url = url + "&transactionSet=" + isaOrSt

  console.log('ERP URL: ' + url);
  return url;
}


}




