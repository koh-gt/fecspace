import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppPreloadingStrategy } from './app.preloading-strategy'
import { BlockViewComponent } from './components/block-view/block-view.component';
import { EightBlocksComponent } from './components/eight-blocks/eight-blocks.component';
import { MempoolBlockViewComponent } from './components/mempool-block-view/mempool-block-view.component';
import { ClockComponent } from './components/clock/clock.component';
import { StatusViewComponent } from './components/status-view/status-view.component';

const browserWindow = window || {};
// @ts-ignore
const browserWindowEnv = browserWindow.__env || {};

const routes: Routes = [
  {
    path: 'testnet',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./bitcoin-graphs.module').then(m => m.BitcoinGraphsModule),
        data: { preload: true },
      },
      {
        path: '',
        loadChildren: () => import('./master-page.module').then(m => m.MasterPageModule),
        data: { preload: true },
      },
      {
        path: 'status',
        data: { networks: ['bitcoin'] },
        component: StatusViewComponent
      },
      {
        path: '',
        loadChildren: () => import('./bitcoin-graphs.module').then(m => m.BitcoinGraphsModule),
        data: { preload: true },
      },
      {
        path: '**',
        redirectTo: '/testnet'
      },
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./bitcoin-graphs.module').then(m => m.BitcoinGraphsModule),
    data: { preload: true },
  },
  {
    path: '',
    loadChildren: () => import('./master-page.module').then(m => m.MasterPageModule),
    data: { preload: true },
  },
  {
    path: 'preview',
    children: [
      {
        path: '',
        loadChildren: () => import('./previews.module').then(m => m.PreviewsModule)
      },
      {
        path: 'testnet',
        loadChildren: () => import('./previews.module').then(m => m.PreviewsModule)
      }
    ],
  },
  {
    path: 'clock',
    redirectTo: 'clock/mempool/0'
  },
  {
    path: 'clock/:mode',
    redirectTo: 'clock/:mode/0'
  },
  {
    path: 'clock/:mode/:index',
    component: ClockComponent,
  },
  {
    path: 'view/block/:id',
    component: BlockViewComponent,
  },
  {
    path: 'view/mempool-block/:index',
    component: MempoolBlockViewComponent,
  },
  {
    path: 'view/blocks',
    component: EightBlocksComponent,
  },
  {
    path: 'status',
    data: { networks: ['bitcoin'] },
    component: StatusViewComponent
  },
  {
    path: '',
    loadChildren: () => import('./bitcoin-graphs.module').then(m => m.BitcoinGraphsModule),
    data: { preload: true },
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking',
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    preloadingStrategy: AppPreloadingStrategy
  })],
})
export class AppRoutingModule { }
