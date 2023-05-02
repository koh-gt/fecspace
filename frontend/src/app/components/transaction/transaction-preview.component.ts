import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectrsApiService } from '../../services/electrs-api.service';
import { ActivatedRoute } from '@angular/router';
import {
  switchMap,
  catchError,
} from 'rxjs/operators';
import { Transaction, Vout } from '../../interfaces/electrs.interface';
import { of, Subscription, Subject } from 'rxjs';
import { StateService } from '../../services/state.service';
import { CacheService } from '../../services/cache.service';
import { OpenGraphService } from '../../services/opengraph.service';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';
import { CpfpInfo } from '../../interfaces/node-api.interface';
import { LiquidUnblinding } from './liquid-ublinding';

@Component({
  selector: 'app-transaction-preview',
  templateUrl: './transaction-preview.component.html',
  styleUrls: ['./transaction-preview.component.scss'],
})
export class TransactionPreviewComponent implements OnInit, OnDestroy {
  network = '';
  tx: Transaction;
  txId: string;
  isLoadingTx = true;
  error: any = undefined;
  errorUnblinded: any = undefined;
  transactionTime = -1;
  fetchCpfpSubscription: Subscription;
  cpfpInfo: CpfpInfo | null;
  showCpfpDetails = false;
  fetchCpfp$ = new Subject<string>();
  liquidUnblinding = new LiquidUnblinding();
  isLiquid = false;
  totalValue: number;
  opReturns: Vout[];
  extraData: 'none' | 'coinbase' | 'opreturn';

  constructor(
    private route: ActivatedRoute,
    private electrsApiService: ElectrsApiService,
    private stateService: StateService,
    private cacheService: CacheService,
    private apiService: ApiService,
    private seoService: SeoService,
    private openGraphService: OpenGraphService,
  ) {}

  ngOnInit() {
    this.stateService.networkChanged$.subscribe(
      (network) => {
        this.network = network;
      }
    );

    this.fetchCpfpSubscription = this.fetchCpfp$
      .pipe(
        switchMap((txId) =>
          this.apiService.getCpfpinfo$(txId).pipe(
            catchError((err) => {
              return of(null);
            })
          )
        )
      )
      .subscribe((cpfpInfo) => {
        this.cpfpInfo = cpfpInfo;
        this.openGraphService.waitOver('cpfp-data-' + this.txId);
      });
  }

  getTransactionTime() {
    this.apiService
      .getTransactionTimes$([this.tx.txid])
      .pipe(
        catchError((err) => {
          return of(0);
        })
      )
      .subscribe((transactionTimes) => {
        this.transactionTime = transactionTimes[0];
        this.openGraphService.waitOver('tx-time-' + this.txId);
      });
  }

  resetTransaction() {
    this.error = undefined;
    this.tx = null;
    this.isLoadingTx = true;
    this.transactionTime = -1;
    this.cpfpInfo = null;
    this.showCpfpDetails = false;
  }

  isCoinbase(tx: Transaction): boolean {
    return tx.vin.some((v: any) => v.is_coinbase === true);
  }

  haveBlindedOutputValues(tx: Transaction): boolean {
    return tx.vout.some((v: any) => v.value === undefined);
  }

  getTotalTxOutput(tx: Transaction) {
    return tx.vout.map((v: Vout) => v.value || 0).reduce((a: number, b: number) => a + b);
  }

  getOpReturns(tx: Transaction): Vout[] {
    return tx.vout.filter((v) => v.scriptpubkey_type === 'op_return' && v.scriptpubkey_asm !== 'OP_RETURN');
  }

  chooseExtraData(): 'none' | 'opreturn' | 'coinbase' {
    if (this.isCoinbase(this.tx)) {
      return 'coinbase';
    } else if (this.opReturns?.length) {
      return 'opreturn';
    } else {
      return 'none';
    }
  }

  ngOnDestroy() {
    this.fetchCpfpSubscription.unsubscribe();
  }
}
