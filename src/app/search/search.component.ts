import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FormsModule,  FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {TradingPartner} from '../tradingPartners/TradingPartner';
import {TpId, TpIdColumns} from '../tradingPartners/tpIds/TpId';
import {tpLinks} from '../tradingPartners/tpIds/tp-links/tp-links';
import {TpRestServiceComponent} from '../services/tprest-service.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

const DEFAULT_DURATION = 300;
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
    standalone: false,
 animations: [
    trigger('tpLinkExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class SearchComponent implements OnInit {

  loading:boolean = false;
  selectedTpId ='';
  form!: FormGroup;

  canRenderDetails = false;
  tpLinksStr:string;

  selectedTp:string[];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  dataTableLabel: string[] = [];
  dataTableKey: string[] = [];
  tpLinksData:tpLinks[] = [];

  isTableExpanded = false;

   dataSource = new MatTableDataSource<any>();

  @ViewChild("searchTpId") focusField: ElementRef;


  constructor(private TradingPartnerService: TpRestServiceComponent,
    private formBuilder: FormBuilder
  ){

    this.form =new FormGroup({
      tpId: new FormControl()
    });

  }

  async ngOnInit() {

      this.dataTableLabel.push("Name");
  this.dataTableLabel.push("TPID");
  this.dataTableLabel.push("AliasName");
  this.dataTableLabel.push("Links");

  this.dataTableKey.push("Name");
    this.dataTableKey.push("TPID");
      this.dataTableKey.push("AliasName");
      this.dataTableKey.push("Links");

    this.form = this.formBuilder.group({
      searchTpId: ['', Validators.required]

  });


    }
    ngAfterViewInit() {
      this.focusField.nativeElement.focus();
    }

    // Toggel Rows
  toggleTableRows() {
    this.isTableExpanded = !this.isTableExpanded;

    this.dataSource.data.forEach((row: any) => {
      row.isExpanded = this.isTableExpanded;
    })
  }

    SelecttpLinks(nm: String) {
    console.info("fetchtp-links: " + nm);
    let getLnk = false;
    this.tpLinksStr = "";  let ind = 0;
     this.dataSource.data.forEach((row: any) => {


              if(row.TPID == nm )
              {
                console.info( "Found: " + row.TPID);
                row.isExpanded = ! row.isExpanded;
                getLnk = true;
              }
            });
            if (getLnk)
            {

              this.TradingPartnerService.fetchTpLinks(nm).subscribe(
              tpLinksData => {

                console.info(ind + ". Number of links: " + tpLinksData.length);
                this.tpLinksData = tpLinksData;
                /*
                tpLinksData.forEach( (lnk: tpLinks) => {


                  this.tpLinksStr += ind + ". " + lnk.Link + ", Direction: " +lnk.Direction + ", Version: " + lnk.Version ;


                  ind++;
                })
                  */
              },
              error => {
                console.error( error.message);
                this.loading = false;
              }

              );
            }
  }


    onTpIdChange()
    {
      console.info('TpId changed');
     let searchTpIdVal = this.form.controls.searchTpId.value.toString().trim();

     console.info('searchTpIdVal: ' + searchTpIdVal);

    this.collapse();
    this.loading = true;


    this.TradingPartnerService.fetchTPforTpId(searchTpIdVal).subscribe((res: any) => {

      this.dataSource.data = res;

      this.canRenderDetails = true;
      this.loading = false;

    });


    }
    clearDetails()
    {
      this.canRenderDetails = false;
    }

    collapsed = true;

    toggle() {
      this.collapsed = !this.collapsed;
    }

    expand() {
      this.collapsed = false;
    }

    collapse() {
      this.collapsed = true;
      window.scrollTo(0, 0);
    }

}
