import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocsComponent } from './docs/docs.component';

const browserWindow = window || {};
// @ts-ignore
const browserWindowEnv = browserWindow.__env || {};

let routes: Routes = [];

routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'faq'
  },
  {
    path: 'api/:type',
    component: DocsComponent
  },
  {
    path: 'faq',
    data: { networks: ['bitcoin'] },
    component: DocsComponent
  },
  {
    path: 'api',
    redirectTo: 'api/rest'
  },
  {
    path: '**',
    redirectTo: 'api/faq'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class DocsRoutingModule { }
