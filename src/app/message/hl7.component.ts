import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import {TransRestServiceComponent} from '../services/transrest-service.component';
import { TpRestServiceComponent } from '../services/tprest-service.component';
import { MatTableDataSource } from '@angular/material/table';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import {MatSelectModule} from '@angular/material/select';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import {DisplayColumns, DisplayColumnsArray} from './DisplayColumns'
import { PageEvent } from '@angular/material/paginator';

import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import {MatRadioModule} from '@angular/material/radio';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonColumnsDisplayColumns } from './CommonColumns';
import e from 'express';

@Component({
  selector: 'app-hl7',
  templateUrl: './hl7.component.html',
  styleUrls: ['./hl7.component.css'],
    standalone: false
})



export class HL7Component implements OnInit, AfterViewInit {
  displayLabel: string = "Display Columns:";

  startDate =  new Date((new Date().getTime() - (24 * 60 * 60 * 1000)));

  endDate: Date = new Date();

  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;

  MessageTypes: string[] = [] ;


  panelExpand: boolean = true;
  loading:boolean = false;
  searchTransaction:boolean = false;
  submitted = false;
  public pageSize = 25;
  public pageIndex = 0;
  form!: FormGroup;
  dataTableLabel: string[] = [];
  dataTableKey: string[] = [];
  canRenderDetails = false;
  conditionColumns: string[] = ['=', '!=', '%StartsWith', 'Contains', 'LIKE', 'NOT LIKE'];
  searchFieldVal:string = "";
  dataSource = new MatTableDataSource<any>();



  searchColumns= [];

  @ViewChild("searchValue") searchValue: ElementRef;
  @ViewChild("searchField") searchField: ElementRef;
  @ViewChild("searchCndition") searchCndition: ElementRef;

  @ViewChild("msgType") msgType: ElementRef;
  @ViewChild("displayCols") displayCols: ElementRef;


  searchString = "";
  searchTypeString = "";
  currentMessageType = "";

  sub:any;
  isTableExpanded = false;
  private queryTriggeredInitSearch = false;

  selDropdownList = [];

  allDropdownList = [];


  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (!this.dataSource.sort) {
      console.debug("Set sort in ViewChild")
      this.dataSource.sort = sort;
    }
  }

  dropdownSettings={};


  constructor(private TransactionService: TransRestServiceComponent,
    private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute){

      tpId: new FormControl();

  }


  ngOnInit()
  {

    this.startDate =  new Date((new Date().getTime() - (24 * 60 * 60 * 1000)));
    console.info("ngOnInit: " + this.startDate);
    let queryParams = 0

    this.form = this.formBuilder.group({
      msgType: ['', Validators.required],
      searchField: ['', Validators.required],
      searchCndition: [''],
      searchValue: [''],
      matStartDate: [''],
      matEndDate:['']
    });

    this.form.controls.matStartDate.setValue(this.startDate);

    this.dropdownSettings = {
      singleSelection: false,
      idField: "key",
      textField: "item_text",
      allowSearchFilter: true,
      enableCheckAll: false,
      maxHeight: 250
    };

    if ( sessionStorage.getItem("DisplayKeys") != null)
    {
      this.dataTableKey = sessionStorage.getItem("DisplayKeys").split(',');
      this.dataTableLabel = sessionStorage.getItem("DisplayLabels").split(',');


    }
    else{
        for (var item of CommonColumnsDisplayColumns)
        {
            this.dataTableLabel.push(item.label);

            this.dataTableKey.push(item.key);

        }
    }

    this.selDropdownList = [];
      for (var i=0; i<this.dataTableKey.length; i++)
      {
        this.selDropdownList.push({key:this.dataTableKey[i], item_text:this.dataTableLabel[i]});
      }
      this.searchColumns =[];
      for (var item of CommonColumnsDisplayColumns)
        {
            if (item.search == 'Y')
            {

              this.searchColumns.push({key:item.key, label:item.label});
            }
        }


    this.sub = this.route.queryParams.subscribe(params => {
      // Defaults to '' if no query param provided.

      this.currentMessageType =  params['MessageType'] || '';
      if (this.currentMessageType !== "")
      {
        queryParams = 1
        this.queryTriggeredInitSearch = true;
        this.searchString = params['search'] || '';
        if(this.searchString==="-")
        {
          this.searchString=""
        }
        this.searchTypeString = params['searchTypeString'];
        console.log('ngOnInit - Query params ' + params['searchTypeString'] +", Dates: " + params['stDate'] +", " + params['endDate'] +", msgType: " + this.currentMessageType +", " + this.searchString);


        this.startDate =  new Date(params['stDate']);
        this.endDate =  new Date(params['endDate']);

        this.form.controls.msgType.setValue(this.currentMessageType);
        this.form.controls.matStartDate.setValue(this.startDate);
        this.form.controls.matEndDate.setValue(this.endDate);


        console.log('ngOnInit - Query params ' + this.searchTypeString +", msgType: " + this.currentMessageType +", " + this.searchString);
      }
    });
    console.info("Message Type: " + this.currentMessageType )
    this.MessageTypes.push('All')

      console.info("Message Types #: " + this.MessageTypes.length);
      if(queryParams === 0)
        {
          this.form.controls.msgType.setValue(this.MessageTypes[0]);
          this.currentMessageType = this.MessageTypes[0];
          console.info("New search Default Date: " + this.startDate)
          this.form.controls.matStartDate.setValue(this.startDate)

          console.info("New search Set MessageType: " + this.currentMessageType +", Date: " + this.form.controls.matStartDate.value)
        }

        CommonColumnsDisplayColumns.forEach( col => {

            this.allDropdownList.push({key:col.key, item_text:col.label});

        });


      this.form.controls.msgType.setValue(this.currentMessageType);
      this.form.controls.searchValue.setValue("");
      this.form.controls.searchField.setValue(this.searchColumns[0].label);
      this.form.controls.searchCndition.setValue(this.conditionColumns[0]);

      this.TransactionService.fetchTransactionTypes().subscribe((res: any) => {

        for (var item of res)
        {
          if (item.Type == 'HL7')
          {
                this.MessageTypes.push(item.TransactionType);
          }

        }
        console.info("Message Types #: " + this.MessageTypes.length);

        if (this.queryTriggeredInitSearch) {
          this.onSearchTransactions();
        }
      });




  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  get f() { return this.form.controls; }

  onSearchTransactions()
    {
      let staticSearchStr =  "";

      if (this.form.controls.matEndDate.value !== null && this.form.controls.matEndDate.value !== "")
      {

        let endDt = new Date( Date.parse(this.form.controls.matEndDate.value))
        let stDt = new Date( Date.parse(this.form.controls.matStartDate.value))
        console.info(this.form.controls.matStartDate.value + ", " + this.form.controls.matEndDate.value )

        this.searchTypeString  = "ProcessDtTm between '" + stDt.getFullYear() + "-" + (stDt.getMonth() + 1) + "-" + stDt.getDate() +"' AND '" + + endDt.getFullYear() + "-" + (endDt.getMonth() + 1) + "-" + endDt.getDate() +"'"
      }
      else
      {
          this.searchTypeString =  "" + this.form.controls.matStartDate.value
      }
      this.canRenderDetails = false;
      console.info("onSearchTransactions msgType: " +this.form.controls.msgType.value +",  currentmsgType: " +  this.currentMessageType +", " + this.searchTypeString)
      if (this.form.controls.msgType.value === '' && this.currentMessageType !== '')
      {
        this.form.controls.msgType.setValue(this.currentMessageType);
      }


      this.loading = true;



        if(this.form.controls.msgType.value !== 'All')
        {
          staticSearchStr =  "MessageType like '%"+ this.form.controls.msgType.value + "'";
        }


        if(this.searchString.length > 0)
        {
          if(staticSearchStr.length > 0)
          {
            staticSearchStr = staticSearchStr + " AND " + this.searchString
          }
          else
          {
            staticSearchStr = this.searchString
          }

        }
        // staticSearchStr = staticSearchStr.replace('AND','') // Remove first AND

        console.info("HL7 search: "+ staticSearchStr + ", SearchType: " +  this.searchTypeString)

        console.info('Transaction search with: ' + staticSearchStr);

        this.TransactionService.fetchHL7Messages(staticSearchStr, this.searchTypeString,  1000).subscribe((res: any) => {

        if(res == null || res.length === 0)
        {
            this.dataSource.data = [];
        }

        else {
          this.dataSource.data = res;
          this.dataSource.sort = this.sort;
        }



        console.info("Data rows with sorted array: " + this.dataSource.data.length +", Display Columns #: " + this.dataTableKey.length  );


        this.setControls();
        this.loading = false;
        this.canRenderDetails = true;


        }, error => {
          console.error('Error fetching HL7 Messages: ', error);
          this.loading = false;
          this.canRenderDetails = true;
          this.dataSource.data = [];
        });


      }



setControls()
{

          console.info("Dropdown: " + this.selDropdownList.length);
          this.form.controls.searchValue.setValue('');


            console.info("allDropdownList.length: " + this.allDropdownList.length);
            console.info("selDropdownList.length: " + this.selDropdownList.length);

            this.panelExpand = false;

}

clearSearch()
    {

          this.canRenderDetails = false;
          this.searchTransaction = false;
          this.searchString = "";
          this.form.controls.searchValue.setValue("");
          this.form.controls.searchField.setValue(this.searchColumns[0].label);
          this.form.controls.searchCndition.setValue(this.conditionColumns[0]);
          console.info('reset fields' + this.form.controls.searchField.value);

    }

addSearch() {

    this.searchTransaction = true;
    this.submitted = true;
    this.setSearchField();

      if(this.searchFieldVal === "")
      {
        alert("Search Field is NULL");
      }
      else
      {
        let  sVal = ""
        console.log("Search for " +this.searchFieldVal)
        for (var item of this.searchColumns)
          {
            if(item.label === this.searchFieldVal)
            {
              sVal = item.key
              break;
            }
          }
          if(sVal === "")
          {
            alert("Search Field is NULL");
          }


            let srchStr = this.form.controls.searchCndition.value
            if (srchStr === 'Contains')
            {
              srchStr = '['
            }

            if(this.searchString !== "")
            {
              this.searchString += " AND " + sVal + srchStr  + " '" + this.searchValue +"'";
            }
            else
            {
              this.searchString =  sVal + " " + srchStr + " '" + this.searchValue +"'";
            }
    }

    }




onItemSelect(inp: any) {
    console.log('onItem Select: '  + inp.item_text +", " + inp.key + ", #: " + this.dataTableLabel.length);
    if (inp.key === undefined)
  {
    this.dataTableLabel.push(inp);
    console.log('onItem Select objIndex ' + inp)
  }
  else{
    this.dataTableLabel.push(inp.item_text);
    this.dataTableKey.push(inp.key);
  }
  sessionStorage.setItem("DisplayKeys", this.dataTableKey.toString());
  sessionStorage.setItem("DisplayLabels", this.dataTableLabel.toString());
  console.log("onItem Select  selDropdownList #: " + this.selDropdownList.length );
}

onItemDeSelect(inp: any)
{
  console.log('onItem DeSelect: ' + inp.item_text  + ", #: " + this.dataTableLabel.length);

    var objIndex = this.dataTableLabel.findIndex(obj => obj === inp.item_text);
    console.log('onItem DeSelect objIndex ' + objIndex)
    if (objIndex > -1) {
       this.dataTableLabel.splice(objIndex, 1);

       this.dataTableKey.splice(objIndex, 1);
    }
    sessionStorage.setItem("DisplayKeys", this.dataTableKey.toString());
    sessionStorage.setItem("DisplayLabels", this.dataTableLabel.toString());
    console.log('onItem DeSelect  ' + this.dataTableKey.length + ", Labels #: " + this.dataTableLabel.length +", selDropdownList #: " + this.selDropdownList.length );


}



messageChange(evt: any)
{
  var selDropdownInsert = false;
  this.currentMessageType = this.form.controls.msgType.value;
  this.displayLabel = "Display columns for: "+this.form.controls.msgType.value;

  this.searchColumns =[];
  if (this.selDropdownList.length === 0)
  {
    selDropdownInsert = true
  }


  var allTempArr= [];
  this.dataSource.data = [];
  console.info(this.displayLabel +", this.currentmsgType: " + this.currentMessageType)


  for (var item of CommonColumnsDisplayColumns)
  {
    if (item.search == 'Y')
    {

      this.searchColumns.push({key:item.key, label:item.label});
    }

      if (selDropdownInsert)
      {
        this.selDropdownList.push({key:item.key, item_text:item.label});
      }


  }


  console.info("selDropdownList #: " + this.selDropdownList.length);
  console.info("searchColumns #: " + this.searchColumns.length);


  this.onSearchTransactions();
}

setSearchField()
{
  console.log("In setSearchField: " +this.form.controls.searchField.value)
  this.searchFieldVal = this.form.controls.searchField.value;
}

allDropdownListFind(label:string)
{
  for(var i=0; i < this.allDropdownList.length; i++  )
  {
    if(this.allDropdownList[i].item_text === label)
    {
      // console.info("allDropdownListFind: " + val.key);
      return i;
    }
  }
  return -1;
}


// Handle right click

onContextMenu(event: MouseEvent, row:any, ind: number) {
  event.preventDefault();

  console.log( ind +'. Row clicked: ' + row.id );

  this.contextMenuPosition.x = event.clientX + 'px';
  this.contextMenuPosition.y = event.clientY + 'px';
  let item: Item ={id: row.id, rowType: row.MessageType};
  this.contextMenu.menuData = { 'item': item };
  this.contextMenu.menu.focusFirstItem('mouse');
  this.contextMenu.openMenu();
}

onContextMenuNew(item: Item) {
  // alert('Click on Action 1 ' + item.id);

       const url = this.router.serializeUrl(this.router.createUrlTree(["/ERP/hl7/hl7-details/"],
      {queryParams: { id:  item.id,
        'search': (this.searchString==="")?'-':this.searchString, 'searchTypeString': this.searchTypeString,
        'MessageType':this.currentMessageType,
        'stDate': this.form.controls.matStartDate.value, 'endDate': this.form.controls.matEndDate.value,
         'sameWindow':false
         } }
       ));
    const newTab = window.open(url, '_blank');
    if(newTab) {
        newTab.opener = null;
    }



}

onContextMenuSame(item: Item) {
  // alert('Click on Action 2' + item.id);

      this.router.navigate(["/hl7/hl7-details/"],
      {queryParams: { id:  item.id,
        'search': (this.searchString==="")?'-':this.searchString, 'searchTypeString': this.searchTypeString,
        'stDate': this.form.controls.matStartDate.value, 'endDate': this.form.controls.matEndDate.value,
        'MessageType':this.currentMessageType, 'sameWindow':true } }
       );

}

 handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    // Logic to fetch/update data based on new pageSize and pageIndex
    console.log('Page event:', e);
  }

}

export interface Item {
  id: number;
  rowType: string;
}

