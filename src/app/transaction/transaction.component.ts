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

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
    standalone: false
})



export class TransactionComponent implements OnInit, AfterViewInit {
  displayLabel: string = "Display columns:";

  startDate =  new Date((new Date().getTime() - (24 * 60 * 60 * 1000)));

  endDate: Date = new Date();

  maxCount = ["ALL", "10", "25", "50", "100", "200"];

  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;

  transactionTypes: string[] = [] ;

  butSaveDisplay: boolean = false;

   nyiColumns = [
    {
      item_id: 'N/A',
      item_text: 'Not Implemented'
    }];

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
  tpDataSource: string[] = [];

  usrDisplayColumns= [

    {
      key: 'usrK',
      Order: '0',
      TransactionCode: 'usrL'
    }];

  transactionsSearchColumns= [
    {
      key: 'Invalid',
      type: 'text',
      label: 'Select Transaction to view the Columns',
      transactionCode: 'XXX',
      detail: '1'
    }];


  searchColumns= this.transactionsSearchColumns.slice();
  searchColumnsOrder: { [key: string]: number } = {};

  @ViewChild("searchValue") searchValue: ElementRef;
  @ViewChild("searchField") searchField: ElementRef;
  @ViewChild("searchCndition") searchCndition: ElementRef;

  @ViewChild("rowCnt") rowCnt: ElementRef;
  @ViewChild("transType") transType: ElementRef;
  @ViewChild("displayCols") displayCols: ElementRef;


  searchString = "";
  searchTypeString = "";
  currentTransType = "";
  tradingPartnerString:string = "";
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

  selectedItems=[];



  constructor(private TransactionService: TransRestServiceComponent,  private TradingPartnerService: TpRestServiceComponent,
    private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute){

      tpId: new FormControl();

  }


  ngOnInit()
  {

    this.startDate =  new Date((new Date().getTime() - (24 * 60 * 60 * 1000)));
    console.info("ngOnInit with  tradingPartner: " + this.startDate);
    let queryParams = 0

    this.form = this.formBuilder.group({
      rowCnt:['', Validators.required],
      transType: ['', Validators.required],
      searchField: ['', Validators.required],
      searchCndition: [''],
      searchValue: [''],
      matStartDate: [''],
      matEndDate:[''],
      Sender:[''],
      Receiver:[''],
      TradingPartner:['All'],
      InterchangeReceiverID:[''],
      InterchangeControlNumber:[''],
      GroupControlNumber:[''],
      InterchangeDate:[''],
      ProcessDtTm:[''],
      ProductTransfer:[''],
      PurchaseOrder:[''],
      InvoiceNumber:[''],
      FileName:[''],
      isaOrSt:['ST']
    });

    this.form.controls.matStartDate.setValue(this.startDate);

    this.dropdownSettings = {
      singleSelection: false,
      idField: "item_id",
      textField: "item_text",
      allowSearchFilter: true,
      enableCheckAll: false,
      maxHeight: 250
    };

    this.sub = this.route.queryParams.subscribe(params => {
      // Defaults to '' if no query param provided.

      this.currentTransType =  params['transaction'] || '';
      if (this.currentTransType !== "")
      {
        queryParams = 1
          this.queryTriggeredInitSearch = true;
        this.searchString = params['search'] || '';
        if(this.searchString==="-")
        {
          this.searchString=""
        }
        this.searchTypeString = params['searchTypeString'];
        this.tradingPartnerString = params['tradingPartner'];
        this.startDate =  new Date(this.searchTypeString);
        this.form.controls.transType.setValue(this.currentTransType);
        this.form.controls.TradingPartner.setValue(this.tradingPartnerString);

         this.startDate =  new Date(params['stDate']);
        this.endDate =  new Date(params['endDate']);

        this.form.controls.matStartDate.setValue(this.startDate);
        this.form.controls.matEndDate.setValue(this.endDate);

        console.log('ngOnInit - Query params ' + this.searchTypeString +", transType: " + this.currentTransType +", " + this.searchString);
      }
    });
    console.info("TransactionType: " + this.currentTransType +",tradingPartner: " + this.tradingPartnerString)
    this.transactionTypes.push('All')
    this.TransactionService.fetchTransactionTypes().subscribe((res: any) => {


      for (var item of res)
      {
        if (item.Type != 'HL7')
        {
              this.transactionTypes.push(item.TransactionType);
        }

      }
      console.info("TransactionTypes #: " + this.transactionTypes.length);
      if(queryParams === 0)
        {
          this.form.controls.transType.setValue(this.transactionTypes[0]);
          this.currentTransType = this.transactionTypes[0];
          console.info("New search Default Date: " + this.startDate)
          this.form.controls.matStartDate.setValue(this.startDate)
          this.clearSearch();
          console.info("New search Set TransactionType: " + this.currentTransType +", Date: " + this.form.controls.matStartDate.value)
        }


    // this.transactionsSearchColumns.push({key: 'Sender', type: 'text', label: 'sender', transactionCode: 'All', detail: 'NA'});

    this.TransactionService.fetchTransactionFields(0).subscribe((res: any) => {
    this.transactionsSearchColumns = [];


      for (var item of res)
      {
        // console.info("Push transactionsSearchColumns: " + item.Key)
        if (item.TransactionCode === "All")

          {
          this.transactionsSearchColumns.push({key: item.Key, type: item.Type, label: item.Label, transactionCode: item.TransactionCode, detail: item.Detail});


          }

      }

      console.info("transactionsSearchColumns: " + this.transactionsSearchColumns.length);
      console.info("Usr Columns: " + this.usrDisplayColumns.length);

      this.form.controls.rowCnt.setValue(this.maxCount[1]);

      this.TransactionService.fetchSearchColumns().subscribe((srchRes: any) => {
        this.searchColumnsOrder = {};
        for (var item of srchRes)
        {
          const key = (item.Key ?? item.key ?? '').toString().trim();
          if (key !== '')
          {
            const ord = Number(item.Order ?? item.order);
            this.searchColumnsOrder[key.toLowerCase()] = Number.isNaN(ord) ? Number.MAX_SAFE_INTEGER : ord;
          }
        }
        console.info('fetchSearchColumns # of columns: ' + Object.keys(this.searchColumnsOrder).length);

        this.TransactionService.fetchDisplayColumns().subscribe((res: any) => {
          this.usrDisplayColumns.splice(0, this.usrDisplayColumns.length)
          this.usrDisplayColumns.push(...res);
          console.info('fetchDisplayColumns # of columns: ' + this.usrDisplayColumns.length);

          if (this.currentTransType !== '')
            {
              // this.searchTypeChange(null);
              this.form.controls.transType.setValue(this.currentTransType);
              // this.form.controls.searchValue.setValue(this.searchString);
              this.form.controls.matStartDate.setValue(this.startDate)

              // this.startDate = this.searchString;

              this.form.controls.rowCnt.setValue("25");

              if (this.searchString !== '')
              {
                this.searchTransaction = true;
              }
              console.log('set search controls, ' + this.searchTransaction);

              console.info("User display columns: " + this.usrDisplayColumns.length);
              this.transactionChange(this.currentTransType);

              console.info('Transaction search for: ' + this.currentTransType);
              if (this.queryTriggeredInitSearch) {
                this.onSearchTransactions();
              }
              // this.form.controls.searchValue.setValue("");
              if (this.searchColumns.length > 0) {
                this.form.controls.searchField.setValue(this.searchColumns[0].label);
              }
              this.form.controls.searchCndition.setValue(this.conditionColumns[0]);

            }
            else{
              this.clearSearch();
            }

        });
      });

      this.tpDataSource.push('All');

      this.TradingPartnerService.fetchTradingPartners().subscribe((res: any) => {

        for (var item of res)
        {

           this.tpDataSource.push(item.Name);

        }

        console.log('# of TPs: ' + this.tpDataSource.length);
      });


    });
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
      this.tradingPartnerString = (this.form.controls.TradingPartner.value  === 'All') ? '': this.form.controls.TradingPartner.value;
      console.info("SearchTransactions for TradingPartner: " + this.tradingPartnerString + ', isa / st: '+ this.form.controls.isaOrSt.value)

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
      console.info("onSearchTransactions TransType: " +this.form.controls.transType.value +",  currentTransType: " +  this.currentTransType +", " + this.searchTypeString)
      if (this.form.controls.transType.value === '' && this.currentTransType !== '')
      {
        this.form.controls.transType.setValue(this.currentTransType);
      }


      this.loading = true;



        if(this.form.controls.transType.value !== 'All')
        {
          staticSearchStr =  "TransactionType = '"+ this.form.controls.transType.value + "'";
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

        console.info("X12 search: "+ staticSearchStr + ", SearchType: " +  this.searchTypeString)

        console.info('Transaction search with: ' + staticSearchStr);
        var rowCnt = this.form.controls.rowCnt.value
        if (rowCnt === "ALL")
        {
          rowCnt = 1000
        }
        this.TransactionService.fetchERPtransactions(staticSearchStr, this.searchTypeString,  this.form.controls.isaOrSt.value, rowCnt, this.tradingPartnerString).subscribe((res: any) => {

        this.dataSource.data = res;

        this.dataSource.sort = this.sort;

        console.info("Data rows with sorted array: " + this.dataSource.data.length);


        this.setControls();
        this.loading = false;
        this.canRenderDetails = true;


        });


      }



setControls()
{
          // this.selectedItems.splice(0, this.selectedItems.length)
          console.info('Populate dataTables with ' + this.selDropdownList.length);
          console.info("Dropdown: " + this.selDropdownList.length);
          this.form.controls.searchValue.setValue('');


            console.info("allDropdownList.length: " + this.allDropdownList.length);
            console.info("selDropdownList.length: " + this.selDropdownList.length);

            this.panelExpand = false;
            this.butSaveDisplay = true;
}

clearSearch()
    {
      this.canRenderDetails = false;
      this.searchTransaction = false;
      this.searchString = "";
      this.form.controls.searchValue.setValue("");
      this.form.controls.searchField.setValue(this.dataTableLabel[0]);
      this.form.controls.searchCndition.setValue(this.conditionColumns[0]);
      console.info('clearSearch fields');
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
    console.log('onItem Select: '  + inp +", " + inp.item_id + ", #: " + this.dataTableLabel.length);
    if (inp.item_id === undefined)
  {
    this.dataTableLabel.push(inp);
    console.log('onItem Select objIndex ' + inp)
  }
  else{
    this.dataTableLabel.push(inp.item_text);
    this.dataTableKey.push(inp.item_id);
  }
  this.saveDisplayColumns();
}

onItemDeSelect(inp: any)
{
  console.log('onItem DeSelect: ' + inp +", " + inp.item_id + ", #: " + this.dataTableLabel.length);
  if (inp.item_id === undefined)
  {
    var objIndex = this.dataTableLabel.findIndex(obj => obj === inp);
    console.log('onItem DeSelect objIndex ' + objIndex)
  }
  else{
    var objIndex = this.dataTableLabel.findIndex(obj => obj === inp.item_text);
    console.log('onItem DeSelect objIndex ' + objIndex)
    if (objIndex > -1) {
      this.dataTableLabel.splice(objIndex, 1);
    }
    objIndex = this.dataTableKey.findIndex(obj => obj === inp.item_id);
    console.log('onItem DeSelect objIndex ' + objIndex)
    if (objIndex > -1) {
      this.dataTableKey.splice(objIndex, 1);
    }
  }
  this.saveDisplayColumns();

}
saveDisplayColumns()
{
  var dispCol = <DisplayColumnsArray>{};
  dispCol.displayColumns = [];
  var ind = 0;
  console.info("selDropdownList #: " + this.selDropdownList.length);
  console.log('Save: ' + this.form.controls.transType.value);
  for (var item of this.selDropdownList)
  {
       console.log('Save: ' + item.item_id);
       dispCol.displayColumns.push({  id: '1',
        TransactionCode: this.form.controls.transType.value,
        key:  item.item_id,
        Order: ind});
        ind++;
  }
  console.log('Save: ' + dispCol.displayColumns.length);

      this.TransactionService.saveDisplayColumns(dispCol).subscribe((res: any) => {

          console.info("TransactionService: " + res);

        });
}

expandCollapse(index: boolean) {
  this.panelExpand = index;
}

searchTypeChange(evt: any)
{
  this.displayLabel = "Display columns for ("+this.form.controls.searchType.value + ")";
  this.searchTypeString = this.form.controls.searchType.value

  this.form.controls.rowCnt.setValue(this.maxCount[1]);

}

tpChange()
{
  console.info("tpChange: " + this.form.controls.TradingPartner.value)
  this.tradingPartnerString = this.form.controls.TradingPartner.value
}

transactionChange(evt: any)
{
  this.displayLabel = "Display columns for ("+this.form.controls.transType.value + ")" ;
  this.dataTableLabel = [];
  this.dataTableKey = [];
  this.selectedItems = [];
  this.searchColumns =[];
  this.selDropdownList= [];

  this.allDropdownList= [];
  var allTempArr= [];
  this.dataSource.data = [];
  console.info(this.displayLabel +", this.currentTransType: " + this.currentTransType)

  // Bryan does not want search to clear
  /**
  if(this.form.controls.transType.value !== this.currentTransType)
  {
    this.clearSearch();
  }
  **/
  this.currentTransType = this.form.controls.transType.value;
  for (var col of this.transactionsSearchColumns)
  {

    if ( (col.transactionCode == 'All') || (col.transactionCode === this.form.controls.transType.value && col.detail != '1'))
    {
      allTempArr.push({item_id:col.key, item_text:col.label});
    }
  }
  this.allDropdownList = allTempArr;
  var tempArr = [];

  for (var col of this.transactionsSearchColumns)
    {
      // console.info("searchColumns push? = " + col.key + ", " + col.transactionCode);
      if ( (col.transactionCode == 'All') || (col.transactionCode === this.form.controls.transType.value && col.detail != '1'))
      {
          this.searchColumns.push(col);
          // console.info("searchColumns pushed: " + col.key);
      }
    }

  if(this.usrDisplayColumns.length > 0)
  {
    console.info("Check usrDisplayColumns: " + this.usrDisplayColumns.length +', allDropdownList #: ' + this.allDropdownList.length);

    for (var disp of this.usrDisplayColumns)
    {
      // console.info(disp.TransactionCode + ", # " + this.transactionsSearchColumns.length +', allDropdownList #: ' + this.allDropdownList.length)
      for (var col of this.transactionsSearchColumns)
      {

        if ( disp.TransactionCode === this.form.controls.transType.value && disp.key === col.key)
        {
          var selInd = this.allDropdownListFind(col.label);
          if(selInd !== -1)
          {
            // console.info(disp.TransactionCode + " PUSH User selected column: " + disp.key + "===" + col.key +", selInd: " + selInd)
            tempArr.push({item_id:selInd, item_text:col.label});

            break;
          }
        }
      }
    }
    this.selDropdownList =  tempArr;
  }
  if(tempArr.length === 0) // Nothing from User display columns
  {
    this.searchColumns = [];
    this.allDropdownList = [];
    var tempArr2 = [];
    for (var col of this.transactionsSearchColumns)
    {

    if ( (col.transactionCode == 'All') || (col.transactionCode === this.form.controls.transType.value && col.detail != '1') )
      {
          // console.info(col.transactionCode + " PUSH " + col.key)

          tempArr.push({item_id:col.key, item_text:col.label});
          tempArr2.push({item_id:col.key, item_text:col.label});

          //  console.info('searchColumns.push: ' + col.label)
          this.searchColumns.push(col);

      }
    }
    this.selDropdownList =  tempArr;
    this.allDropdownList = tempArr2;
  }
  else{
    console.info("Nothing from User display columns")
  }

  // Two fields that are not part of ERP data table
  this.dataTableLabel.push('Sender');
  this.dataTableKey.push('Sender');
  this.dataTableLabel.push('Receiver');
  this.dataTableKey.push('Receiver');

  for (var item of this.selDropdownList)
  {
      this.dataTableLabel.push(item.item_text);
      this.dataTableKey.push(item.item_id);

      //  console.info("selDropdownList key: " + item.item_id +", val: " +item.item_text )
      this.selectedItems.push({key:item.item_id, label:item.item_text})

  }


  this.searchColumns = this.sortSearchColumns(this.searchColumns);

  console.info("allDropdownList #: " + this.allDropdownList.length);
  console.info("selDropdownList #: " + this.selDropdownList.length);
  console.info("searchColumns #: " + this.searchColumns.length);

  this.butSaveDisplay = false;
}

sortSearchColumns(columns: any[])
{
  const hasOrder = Object.keys(this.searchColumnsOrder).length > 0;
  const filtered = hasOrder
    ? columns.filter(c => this.searchColumnsOrder[(c.key || '').toString().toLowerCase()] !== undefined)
    : columns;

  return filtered.sort((a: any, b: any) => {
    const aOrder = this.searchColumnsOrder[(a.key || '').toString().toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
    const bOrder = this.searchColumnsOrder[(b.key || '').toString().toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    const aLabel = (a.label || '').toString();
    const bLabel = (b.label || '').toString();
    return aLabel.localeCompare(bLabel);
  });
}

setSearchField()
{
  console.log("In setSearchField: " +this.form.controls.searchField.value)
  this.searchFieldVal = this.form.controls.searchField.value;
}

allDropdownListFind(label:string)
{
  for(var val of this.allDropdownList)
  {
    if(val.item_text === label)
    {
      // console.info("allDropdownListFind: " + val.item_id);
      return val.item_id
    }
  }
  return -1;
}


onRowClicked(row) {
  console.log('Row clicked: ' + row.id + ", " + row.TransactionType + ", Search: " + this.searchString + ', searchTypeString: '+ this.searchTypeString );
  this.router.navigate(["/transaction/transaction-details/"],
  {queryParams: { id:  row.id, 'transaction': this.form.controls.transType.value,
    'search': (this.searchString==="")?'-':this.searchString, 'searchTypeString': this.searchTypeString,
     'TransactionType':row.TransactionType, 'TradingPartner':this.tradingPartnerString,
     'stDate': this.form.controls.matStartDate.value, 'endDate': this.form.controls.matEndDate.value
    } }
   );
}

// Handle right click

onContextMenu(event: MouseEvent, row:any, ind: number) {
  event.preventDefault();

  console.log( ind +'. Row clicked: ' + row.id );

  this.contextMenuPosition.x = event.clientX + 'px';
  this.contextMenuPosition.y = event.clientY + 'px';
  let item: Item ={id: row.id, rowType: row.TransactionType};
  this.contextMenu.menuData = { 'item': item };
  this.contextMenu.menu.focusFirstItem('mouse');
  this.contextMenu.openMenu();
}

onContextMenuNew(item: Item) {
  // alert('Click on Action 1 ' + item.id);

       const url = this.router.serializeUrl(this.router.createUrlTree(["/ERP/transaction/transaction-details/"],
      {queryParams: { id:  item.id, 'transaction': this.form.controls.transType.value,
        'search': (this.searchString==="")?'-':this.searchString, 'searchTypeString': this.searchTypeString,
        'TransactionType':item.rowType, 'TradingPartner':this.tradingPartnerString,
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

      this.router.navigate(["/transaction/transaction-details/"],
      {queryParams: { id:  item.id, 'transaction': this.form.controls.transType.value,
        'search': (this.searchString==="")?'-':this.searchString, 'searchTypeString': this.searchTypeString,
        'TransactionType':item.rowType, 'TradingPartner':this.tradingPartnerString,
        'stDate': this.form.controls.matStartDate.value, 'endDate': this.form.controls.matEndDate.value,
        'sameWindow':true } }
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

