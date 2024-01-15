import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NodesNetworksChartComponent } from '../lightning/nodes-networks-chart/nodes-networks-chart.component';
import { LightningStatisticsChartComponent } from '../lightning/statistics-chart/lightning-statistics-chart.component';
import { NodesPerISPChartComponent } from '../lightning/nodes-per-isp-chart/nodes-per-isp-chart.component';
import { NodesPerCountryChartComponent } from '../lightning/nodes-per-country-chart/nodes-per-country-chart.component';
import { NodesMap } from '../lightning/nodes-map/nodes-map.component';
import { NodesChannelsMap } from '../lightning/nodes-channels-map/nodes-channels-map.component';

const routes: Routes = [
  {
    path: 'nodes-networks',
    data: { networks: ['bitcoin'] },
    component: NodesNetworksChartComponent,
  },
  {
    path: 'capacity',
    data: { networks: ['bitcoin'] },
    component: LightningStatisticsChartComponent,
  },
  {
    path: 'nodes-per-isp',
    data: { networks: ['bitcoin'] },
    component: NodesPerISPChartComponent,
  },
  {
    path: 'nodes-per-country',
    data: { networks: ['bitcoin'] },
    component: NodesPerCountryChartComponent,
  },
  {
    path: 'nodes-map',
    data: { networks: ['bitcoin'] },
    component: NodesMap,
  },
  {
    path: 'nodes-channels-map',
    data: { networks: ['bitcoin'] },
    component: NodesChannelsMap,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LightningGraphsRoutingModule { }

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LightningGraphsRoutingModule,
  ],
})
export class LightningGraphsModule { }
