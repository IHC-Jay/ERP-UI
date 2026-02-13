import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AuthGuard } from './login/auth.guard';
import { TradingPartnersComponent } from './tradingPartners/tradingPartners.component';
import { TpIdComponent } from './tradingPartners/tpIds/tpIds.component';
import { tpLinksComponent } from './tradingPartners/tpIds/tp-links/tp-links.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import {AddEditComponent} from './tradingPartners/tpIds/tp-links/add-edit.component';
import { SearchComponent } from './search/search.component';
import {TransactionComponent} from './transaction/transaction.component'
import {TransactionDetailComponent} from './transaction/transaction-details/transaction-details.component';
import {HL7Component} from './message/hl7.component';
import {Hl7DetailComponent} from './message/transaction-details/hl7-details.component';
import { AddEditTP } from './tradingPartners/add-edit.TP';


const appRoutes: Routes = [
  {path: 'TradingPartners', component: TradingPartnersComponent, canActivate: [AuthGuard]},
  {path: 'TradingPartners/tp-add/:tpNm', component: AddEditTP, canActivate: [AuthGuard]},
  {path: 'TradingPartners/tp-add', component: AddEditTP, canActivate: [AuthGuard]},
  {path: 'TradingPartners/tpIds/:tpId', component: TpIdComponent, canActivate: [AuthGuard]},
  {path: 'TradingPartners/tpIds/tp-links/:tpId/:Type/:Name/:AliasName', component: tpLinksComponent, canActivate: [AuthGuard]},
  {path: 'TradingPartners/tpIds/tp-link/tpLink-edit/:tpId/:tpLink/:type/:tpName/:aliasName', component: AddEditComponent, canActivate: [AuthGuard]},
  {path: 'TradingPartners/tpIds/tp-link/tpLink-add/:tpId/:tpName/:aliasName/:type', component: AddEditComponent, canActivate: [AuthGuard]},
  {path: 'search', component: SearchComponent, canActivate: [AuthGuard]},
  {path: 'transaction', component: TransactionComponent, canActivate: [AuthGuard]},
  {path: 'transaction/transaction-details', component: TransactionDetailComponent, canActivate: [AuthGuard]},
  {path: 'hl7', component: HL7Component, canActivate: [AuthGuard]},
  {path: 'hl7/hl7-details', component: Hl7DetailComponent, canActivate: [AuthGuard]},
];

@NgModule({
imports: [BrowserModule,
  ReactiveFormsModule,
  RouterModule.forRoot(appRoutes)],
exports: [RouterModule]
})

export class AppRoutingModule{

}
