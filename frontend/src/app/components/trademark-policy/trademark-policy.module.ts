import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TrademarkPolicyComponent } from './trademark-policy.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: TrademarkPolicyComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class TrademarkRoutingModule { }

@NgModule({
  imports: [
    CommonModule,
    TrademarkRoutingModule,
    SharedModule,
  ],
  declarations: [
    TrademarkPolicyComponent,
  ]
})
export class TrademarkModule { }






