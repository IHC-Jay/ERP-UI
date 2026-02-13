import { Component, OnInit, Optional, Inject } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {ModalHelperService} from './modal-helper.service';

import {MAT_DIALOG_DATA, MatDialogRef}  from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-modal-erp',
  templateUrl: './modal-erp.component.html',
  styleUrls: ['./modal-erp.component.css'],
    standalone: false
})

export class ModalErpComponent {


  erpData = "";
  fileName = 'Erp-File'+'.txt';

  selection = new SelectionModel(true, []);
  save = () => this.modalHelperService.save(this.erpData, this.fileName);
  filter = () => this.modalHelperService.filter();
  sort = () => this.modalHelperService.sort();

  masterToggle = (selection, dataSource) => this.modalHelperService.masterToggle(selection, dataSource);
  isAllSelected = (selection, dataSource) => this.modalHelperService.isAllSelected(selection, dataSource);

  constructor(
    public dialogRef: MatDialogRef<ModalErpComponent>,
    public modalHelperService: ModalHelperService,
    @Inject(MAT_DIALOG_DATA) public data: string[]
  ) {
    console.log('ModalErpComponent constructor: ' + data[1]);
    this.erpData = data[0];
    this.fileName = data[1];

  }
onCloseClick(): void {
    this.dialogRef.close(); // Closes the dialog without returning data
  }

}
