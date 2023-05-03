import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { StateService } from './state.service';
import { environment } from '../../../src/environments/environment';
import { AssetExtended } from '../interfaces/electrs.interface';

@Injectable({
  providedIn: 'root'
})
export class AssetsService {
  nativeAssetId = environment.nativeAssetId;

  getAssetsJson$: Observable<{ array: AssetExtended[]; objects: any}>;
  getAssetsMinimalJson$: Observable<any>;
  getWorldMapJson$: Observable<any>;

  constructor(
    private httpClient: HttpClient,
    private stateService: StateService,
  ) {
    let apiBaseUrl = '';
    if (!this.stateService.isBrowser) {
      apiBaseUrl = this.stateService.env.NGINX_PROTOCOL + '://' + this.stateService.env.NGINX_HOSTNAME + ':' + this.stateService.env.NGINX_PORT;
    }

    this.getAssetsJson$ = this.stateService.networkChanged$
      .pipe(
        switchMap(() => this.httpClient.get(`${apiBaseUrl}/resources/assets${this.stateService.network === 'liquidtestnet' ? '-testnet' : ''}.json`)),
        map((rawAssets) => {
          const assets: AssetExtended[] = Object.values(rawAssets);
  
          return {
            objects: rawAssets,
            array: assets.sort((a: any, b: any) => a.name.localeCompare(b.name)),
          };
        }),
        shareReplay(1),
      );
    this.getAssetsMinimalJson$ = this.stateService.networkChanged$
    .pipe(
      switchMap(() => this.httpClient.get(`${apiBaseUrl}/resources/assets${this.stateService.network === 'liquidtestnet' ? '-testnet' : ''}.minimal.json`)),
      map((assetsMinimal) => {
        return assetsMinimal;
      }),
      shareReplay(1),
    );

    this.getWorldMapJson$ = this.httpClient.get(apiBaseUrl + '/resources/worldmap.json').pipe(shareReplay());
  }
}
