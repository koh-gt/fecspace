import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { CpfpInfo, OptimizedMempoolStats, AddressInformation, LiquidPegs, ITranslators,
  PoolStat, BlockExtended, TransactionStripped, RewardStats, AuditScore, BlockSizesAndWeights, RbfTree, BlockAudit, Acceleration, AccelerationHistoryParams } from '../interfaces/node-api.interface';
import { BehaviorSubject, Observable, catchError, filter, of, shareReplay, take, tap } from 'rxjs';
import { StateService } from './state.service';
import { IBackendInfo, WebsocketResponse } from '../interfaces/websocket.interface';
import { Outspend, Transaction } from '../interfaces/electrs.interface';
import { Conversion } from './price.service';
import { MenuGroup } from '../interfaces/services.interface';
import { StorageService } from './storage.service';

// Todo - move to config.json
const SERVICES_API_PREFIX = `/api/v1/services`;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiBaseUrl: string; // base URL is protocol, hostname, and port
  private apiBasePath: string; // network path is /testnet, etc. or '' for mainnet

  private requestCache = new Map<string, { subject: BehaviorSubject<any>, expiry: number }>;

  constructor(
    private httpClient: HttpClient,
    private stateService: StateService,
    private storageService: StorageService
  ) {
    this.apiBaseUrl = ''; // use relative URL by default
    if (!stateService.isBrowser) { // except when inside AU SSR process
      this.apiBaseUrl = this.stateService.env.NGINX_PROTOCOL + '://' + this.stateService.env.NGINX_HOSTNAME + ':' + this.stateService.env.NGINX_PORT;
    }
    this.apiBasePath = ''; // assume mainnet by default
    this.stateService.networkChanged$.subscribe((network) => {
      this.apiBasePath = network ? '/' + network : '';
    });

    if (this.stateService.env.GIT_COMMIT_HASH_MEMPOOL_SPACE) {
      this.getServicesBackendInfo$().subscribe(version => {
        this.stateService.servicesBackendInfo$.next(version);
      })
    }
  }

  private generateCacheKey(functionName: string, params: any[]): string {
    return functionName + JSON.stringify(params);
  }

  // delete expired cache entries
  private cleanExpiredCache(): void {
    this.requestCache.forEach((value, key) => {
      if (value.expiry < Date.now()) {
        this.requestCache.delete(key);
      }
    });
  }

  cachedRequest<T, F extends (...args: any[]) => Observable<T>>(
    apiFunction: F,
    expireAfter: number, // in ms
    ...params: Parameters<F>
  ): Observable<T> {
    this.cleanExpiredCache();

    const cacheKey = this.generateCacheKey(apiFunction.name, params);
    if (!this.requestCache.has(cacheKey)) {
      const subject = new BehaviorSubject<T | null>(null);
      this.requestCache.set(cacheKey, { subject, expiry: Date.now() + expireAfter });

      apiFunction.bind(this)(...params).pipe(
        tap(data => {
          subject.next(data as T);
        }),
        catchError((error) => {
          subject.error(error);
          return of(null);
        }),
        shareReplay(1),
      ).subscribe();
    }

    return this.requestCache.get(cacheKey).subject.asObservable().pipe(filter(val => val !== null), take(1));
  }

  list2HStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/2h');
  }

  list24HStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/24h');
  }

  list1WStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/1w');
  }

  list1MStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/1m');
  }

  list3MStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/3m');
  }

  list6MStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/6m');
  }

  list1YStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/1y');
  }

  list2YStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/2y');
  }

  list3YStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/3y');
  }

  list4YStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/4y');
  }

  listAllTimeStatistics$(): Observable<OptimizedMempoolStats[]> {
    return this.httpClient.get<OptimizedMempoolStats[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/statistics/all');
  }

  getTransactionTimes$(txIds: string[]): Observable<number[]> {
    let params = new HttpParams();
    txIds.forEach((txId: string) => {
      params = params.append('txId[]', txId);
    });
    return this.httpClient.get<number[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/transaction-times', { params });
  }

  getAboutPageProfiles$(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + '/api/v1/services/sponsors');
  }

  getOgs$(): Observable<any> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + '/api/v1/donations');
  }

  getTranslators$(): Observable<ITranslators> {
    return this.httpClient.get<ITranslators>(this.apiBaseUrl + '/api/v1/translators');
  }

  getContributor$(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + '/api/v1/contributors');
  }

  getInitData$(): Observable<WebsocketResponse> {
    return this.httpClient.get<WebsocketResponse>(this.apiBaseUrl + this.apiBasePath + '/api/v1/init-data');
  }

  getCpfpinfo$(txid: string): Observable<CpfpInfo> {
    return this.httpClient.get<CpfpInfo>(this.apiBaseUrl + this.apiBasePath + '/api/v1/cpfp/' + txid);
  }

  validateAddress$(address: string): Observable<AddressInformation> {
    return this.httpClient.get<AddressInformation>(this.apiBaseUrl + this.apiBasePath + '/api/v1/validate-address/' + address);
  }

  getRbfHistory$(txid: string): Observable<{ replacements: RbfTree, replaces: string[] }> {
    return this.httpClient.get<{ replacements: RbfTree, replaces: string[] }>(this.apiBaseUrl + this.apiBasePath + '/api/v1/tx/' + txid + '/rbf');
  }

  getRbfCachedTx$(txid: string): Observable<Transaction> {
    return this.httpClient.get<Transaction>(this.apiBaseUrl + this.apiBasePath + '/api/v1/tx/' + txid + '/cached');
  }

  getRbfList$(fullRbf: boolean, after?: string): Observable<RbfTree[]> {
    return this.httpClient.get<RbfTree[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/' + (fullRbf ? 'fullrbf/' : '') + 'replacements/' + (after || ''));
  }

  listFeaturedAssets$(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + '/api/v1/assets/featured');
  }

  getAssetGroup$(id: string): Observable<any> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + '/api/v1/assets/group/' + id);
  }

  postTransaction$(hexPayload: string): Observable<any> {
    return this.httpClient.post<any>(this.apiBaseUrl + this.apiBasePath + '/api/tx', hexPayload, { responseType: 'text' as 'json'});
  }

  listPools$(interval: string | undefined) : Observable<any> {
    return this.httpClient.get<any>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/pools` +
      (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
    );
  }

  getPoolStats$(slug: string): Observable<PoolStat> {
    return this.httpClient.get<PoolStat>(this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/pool/${slug}`);
  }

  getPoolHashrate$(slug: string): Observable<any> {
    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/pool/${slug}/hashrate`);
  }

  getPoolBlocks$(slug: string, fromHeight: number): Observable<BlockExtended[]> {
    return this.httpClient.get<BlockExtended[]>(
        this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/pool/${slug}/blocks` +
        (fromHeight !== undefined ? `/${fromHeight}` : '')
      );
  }

  getBlocks$(from: number): Observable<BlockExtended[]> {
    return this.httpClient.get<BlockExtended[]>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/blocks` +
      (from !== undefined ? `/${from}` : ``)
    );
  }

  getBlock$(hash: string): Observable<BlockExtended> {
    return this.httpClient.get<BlockExtended>(this.apiBaseUrl + this.apiBasePath + '/api/v1/block/' + hash);
  }

  getBlockDataFromTimestamp$(timestamp: number): Observable<any> {
    return this.httpClient.get<number>(this.apiBaseUrl + this.apiBasePath + '/api/v1/mining/blocks/timestamp/' + timestamp);
  }

  getStrippedBlockTransactions$(hash: string): Observable<TransactionStripped[]> {
    return this.httpClient.get<TransactionStripped[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/block/' + hash + '/summary');
  }

  getDifficultyAdjustments$(interval: string | undefined): Observable<any> {
    return this.httpClient.get<any[]>(
        this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/difficulty-adjustments` +
        (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
      );
  }

  getHistoricalHashrate$(interval: string | undefined): Observable<any> {
    return this.httpClient.get<any[]>(
        this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/hashrate` +
        (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
      );
  }

  getHistoricalPoolsHashrate$(interval: string | undefined): Observable<any> {
    return this.httpClient.get<any[]>(
        this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/hashrate/pools` +
        (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
      );
  }

  getHistoricalBlockFees$(interval: string | undefined) : Observable<any> {
    return this.httpClient.get<any[]>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/blocks/fees` +
      (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
    );
  }

  getHistoricalBlockRewards$(interval: string | undefined) : Observable<any> {
    return this.httpClient.get<any[]>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/blocks/rewards` +
      (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
    );
  }

  getHistoricalBlockFeeRates$(interval: string | undefined) : Observable<any> {
    return this.httpClient.get<any[]>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/blocks/fee-rates` +
      (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
    );
  }

  getHistoricalBlockSizesAndWeights$(interval: string | undefined) : Observable<HttpResponse<BlockSizesAndWeights>> {
    return this.httpClient.get<BlockSizesAndWeights>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/blocks/sizes-weights` +
      (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
    );
  }

  getHistoricalBlocksHealth$(interval: string | undefined) : Observable<any> {
    return this.httpClient.get<any[]>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/blocks/predictions` +
      (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
    );
  }

  getBlockAudit$(hash: string) : Observable<BlockAudit> {
    return this.httpClient.get<BlockAudit>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/block/${hash}/audit-summary`
    );
  }

  getBlockAuditScores$(from: number): Observable<AuditScore[]> {
    return this.httpClient.get<AuditScore[]>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/blocks/audit/scores` +
      (from !== undefined ? `/${from}` : ``)
    );
  }

  getBlockAuditScore$(hash: string) : Observable<any> {
    return this.httpClient.get<any>(
      this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/blocks/audit/score/` + hash
    );
  }

  getRewardStats$(blockCount: number = 144): Observable<RewardStats> {
    return this.httpClient.get<RewardStats>(this.apiBaseUrl + this.apiBasePath + `/api/v1/mining/reward-stats/${blockCount}`);
  }

  getEnterpriseInfo$(name: string): Observable<any> {
    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + `/api/v1/services/enterprise/info/` + name);
  }

  getChannelByTxIds$(txIds: string[]): Observable<any[]> {
    let params = new HttpParams();
    txIds.forEach((txId: string) => {
      params = params.append('txId[]', txId);
    });
    return this.httpClient.get<any[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/channels/txids/', { params });
  }

  lightningSearch$(searchText: string): Observable<any[]> {
    let params = new HttpParams().set('searchText', searchText);
    return this.httpClient.get<any[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/search', { params });
  }

  getNodesPerIsp(): Observable<any> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/isp-ranking');
  }

  getNodeForCountry$(country: string): Observable<any> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/country/' + country);
  }

  getNodeForISP$(isp: string): Observable<any> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/isp/' + isp);
  }

  getNodesPerCountry$(): Observable<any> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/countries');
  }

  getWorldNodes$(): Observable<any> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/world');
  }

  getChannelsGeo$(publicKey?: string, style?: 'graph' | 'nodepage' | 'widget' | 'channelpage'): Observable<any> {
    return this.httpClient.get<any[]>(
      this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/channels-geo' +
        (publicKey !== undefined ? `/${publicKey}`   : '') +
        (style     !== undefined ? `?style=${style}` : '')
    );
  }

  getHistoricalPrice$(timestamp: number | undefined): Observable<Conversion> {
    if (this.stateService.isAnyTestnet()) {
      return of({
        prices: [],
        exchangeRates: {
          USDEUR: 0,
          USDGBP: 0,
          USDCAD: 0,
          USDCHF: 0,
          USDAUD: 0,
          USDJPY: 0,
        }
      });
    }
    return this.httpClient.get<Conversion>(
      this.apiBaseUrl + this.apiBasePath + '/api/v1/historical-price' +
        (timestamp ? `?timestamp=${timestamp}` : '')
    );
  }

  /**
   * Services
   */

  getNodeOwner$(publicKey: string): Observable<any> {
    let params = new HttpParams()
      .set('node_public_key', publicKey);
    return this.httpClient.get<any>(`${SERVICES_API_PREFIX}/lightning/claim/current`, { params, observe: 'response' });
  }

  getUserMenuGroups$(): Observable<MenuGroup[]> {
    const auth = this.storageService.getAuth();
    if (!auth) {
      return of(null);
    }

    return this.httpClient.get<MenuGroup[]>(`${SERVICES_API_PREFIX}/account/menu`);
  }

  getUserInfo$(): Observable<any> {
    const auth = this.storageService.getAuth();
    if (!auth) {
      return of(null);
    }

    return this.httpClient.get<any>(`${SERVICES_API_PREFIX}/account`);
  }

  logout$(): Observable<any> {
    const auth = this.storageService.getAuth();
    if (!auth) {
      return of(null);
    }

    localStorage.removeItem('auth');
    return this.httpClient.post(`${SERVICES_API_PREFIX}/auth/logout`, {});
  }

  getServicesBackendInfo$(): Observable<IBackendInfo> {
    return this.httpClient.get<IBackendInfo>(`${SERVICES_API_PREFIX}/version`);
  }

  estimate$(txInput: string) {
    return this.httpClient.post<any>(`${SERVICES_API_PREFIX}/accelerator/estimate`, { txInput: txInput }, { observe: 'response' });
  }

  accelerate$(txInput: string, userBid: number) {
    return this.httpClient.post<any>(`${SERVICES_API_PREFIX}/accelerator/accelerate`, { txInput: txInput, userBid: userBid });
  }

  getAccelerations$(): Observable<Acceleration[]> {
    return this.httpClient.get<Acceleration[]>(`${SERVICES_API_PREFIX}/accelerator/accelerations`);
  }

  getAccelerationHistory$(params: AccelerationHistoryParams): Observable<Acceleration[]> {
    return this.httpClient.get<Acceleration[]>(`${SERVICES_API_PREFIX}/accelerator/accelerations/history`, { params: { ...params } });
  }
}
