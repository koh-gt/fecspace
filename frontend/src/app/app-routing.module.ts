import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppPreloadingStrategy } from './app.preloading-strategy';
import { StartComponent } from './components/start/start.component';
import { TransactionComponent } from './components/transaction/transaction.component';
import { BlockComponent } from './components/block/block.component';
import { ClockMinedComponent as ClockMinedComponent } from './components/clock/clock-mined.component';
import { ClockMempoolComponent as ClockMempoolComponent } from './components/clock/clock-mempool.component';
import { AddressComponent } from './components/address/address.component';
import { MasterPageComponent } from './components/master-page/master-page.component';
import { AboutComponent } from './components/about/about.component';
import { StatusViewComponent } from './components/status-view/status-view.component';
import { TermsOfServiceComponent } from './components/terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TrademarkPolicyComponent } from './components/trademark-policy/trademark-policy.component';
import { PushTransactionComponent } from './components/push-transaction/push-transaction.component';
import { BlocksList } from './components/blocks-list/blocks-list.component';
import { RbfList } from './components/rbf-list/rbf-list.component';

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
        loadChildren: () => import('./graphs/graphs.module').then(m => m.GraphsModule),
        data: { preload: true },
      },
      {
        path: '',
        component: MasterPageComponent,
        children: [
          {
            path: 'mining/blocks',
            redirectTo: 'blocks',
            pathMatch: 'full'
          },
          {
            path: 'tx/push',
            component: PushTransactionComponent,
          },
          {
            path: 'about',
            component: AboutComponent,
          },
          {
            path: 'blocks',
            component: BlocksList,
          },
          {
            path: 'rbf',
            component: RbfList,
          },
          {
            path: 'terms-of-service',
            component: TermsOfServiceComponent
          },
          {
            path: 'privacy-policy',
            component: PrivacyPolicyComponent
          },
          {
            path: 'trademark-policy',
            component: TrademarkPolicyComponent
          },
          {
            path: 'address/:id',
            children: [],
            component: AddressComponent,
            data: {
              ogImage: true,
              networkSpecific: true,
            }
          },
          {
            path: 'tx',
            component: StartComponent,
            data: { networkSpecific: true },
            children: [
              {
                path: ':id',
                component: TransactionComponent
              },
            ],
          },
          {
            path: 'block',
            component: StartComponent,
            data: { networkSpecific: true },
              children: [
              {
                path: ':id',
                component: BlockComponent,
                data: {
                  ogImage: true
                }
              },
            ],
          },
          {
            path: 'docs',
            loadChildren: () => import('./docs/docs.module').then(m => m.DocsModule),
            data: { preload: true },
          },
          {
            path: 'api',
            loadChildren: () => import('./docs/docs.module').then(m => m.DocsModule)
          },
          {
            path: 'lightning',
            loadChildren: () => import('./lightning/lightning.module').then(m => m.LightningModule),
            data: { preload: browserWindowEnv && browserWindowEnv.LIGHTNING === true, networks: ['bitcoin'] },
          },
        ],
      },
      {
        path: 'status',
        data: { networks: ['bitcoin', 'liquid'] },
        component: StatusViewComponent
      },
      {
        path: '',
        loadChildren: () => import('./graphs/graphs.module').then(m => m.GraphsModule)
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
    loadChildren: () => import('./graphs/graphs.module').then(m => m.GraphsModule)
  },
  {
    path: '',
    component: MasterPageComponent,
    children: [
      {
        path: 'mining/blocks',
        redirectTo: 'blocks',
        pathMatch: 'full'
      },
      {
        path: 'tx/push',
        component: PushTransactionComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'blocks',
        component: BlocksList,
      },
      {
        path: 'rbf',
        component: RbfList,
      },
      {
        path: 'terms-of-service',
        component: TermsOfServiceComponent
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent
      },
      {
        path: 'trademark-policy',
        component: TrademarkPolicyComponent
      },
      {
        path: 'address/:id',
        children: [],
        component: AddressComponent,
        data: {
          ogImage: true,
          networkSpecific: true,
        }
      },
      {
        path: 'tx',
        data: { networkSpecific: true },
        component: StartComponent,
        children: [
          {
            path: ':id',
            component: TransactionComponent
          },
        ],
      },
      {
        path: 'block',
        data: { networkSpecific: true },
        component: StartComponent,
        children: [
          {
            path: ':id',
            component: BlockComponent,
            data: {
              ogImage: true
            }
          },
        ],
      },
      {
        path: 'docs',
        loadChildren: () => import('./docs/docs.module').then(m => m.DocsModule)
      },
      {
        path: 'api',
        loadChildren: () => import('./docs/docs.module').then(m => m.DocsModule)
      },
      {
        path: 'lightning',
        data: { networks: ['bitcoin'] },
        loadChildren: () => import('./lightning/lightning.module').then(m => m.LightningModule)
      },
    ],
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
      },
      {
        path: 'signet',
        loadChildren: () => import('./previews.module').then(m => m.PreviewsModule)
      },
    ],
  },
  {
    path: 'clock-mined',
    component: ClockMinedComponent,
  },
  {
    path: 'clock-mempool',
    component: ClockMempoolComponent,
  },
  {
    path: 'status',
    data: { networks: ['bitcoin', 'liquid'] },
    component: StatusViewComponent
  },
  {
    path: '',
    loadChildren: () => import('./graphs/graphs.module').then(m => m.GraphsModule)
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
