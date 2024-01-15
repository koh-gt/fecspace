import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ElectrsApiService } from '../../services/electrs-api.service';
import { switchMap, tap, throttleTime, catchError, shareReplay, startWith, pairwise, filter } from 'rxjs/operators';
import { of, Subscription, asyncScheduler, forkJoin } from 'rxjs';
import { StateService } from '../../services/state.service';
import { SeoService } from '../../services/seo.service';
import { OpenGraphService } from '../../services/opengraph.service';
import { BlockExtended, TransactionStripped } from '../../interfaces/node-api.interface';
import { ApiService } from '../../services/api.service';
import { seoDescriptionNetwork } from '../../shared/common.utils';
import { BlockOverviewGraphComponent } from '../../components/block-overview-graph/block-overview-graph.component';

@Component({
  selector: 'app-block-preview',
  templateUrl: './block-preview.component.html',
  styleUrls: ['./block-preview.component.scss']
})
export class BlockPreviewComponent implements OnInit, OnDestroy {
  network = '';
  block: BlockExtended;
  blockHeight: number;
  blockHash: string;
  rawId: string;
  isLoadingBlock = true;
  strippedTransactions: TransactionStripped[];
  overviewTransitionDirection: string;
  isLoadingOverview = true;
  error: any;
  blockSubsidy: number;
  fees: number;
  overviewError: any = null;

  overviewSubscription: Subscription;
  networkChangedSubscription: Subscription;

  @ViewChild('blockGraph') blockGraph: BlockOverviewGraphComponent;

  constructor(
    private route: ActivatedRoute,
    private electrsApiService: ElectrsApiService,
    public stateService: StateService,
    private seoService: SeoService,
    private openGraphService: OpenGraphService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.network = this.stateService.network;

    const block$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.rawId = params.get('id') || '';
        this.openGraphService.waitFor('block-viz-' + this.rawId);
        this.openGraphService.waitFor('block-data-' + this.rawId);

        const blockHash: string = params.get('id') || '';
        this.block = undefined;
        this.error = undefined;
        this.overviewError = undefined;
        this.fees = undefined;

        let isBlockHeight = false;
        if (/^[0-9]+$/.test(blockHash)) {
          isBlockHeight = true;
        } else {
          this.blockHash = blockHash;
        }

        this.isLoadingBlock = true;
        this.isLoadingOverview = true;

        if (isBlockHeight) {
          return this.electrsApiService.getBlockHashFromHeight$(parseInt(blockHash, 10))
            .pipe(
              switchMap((hash) => {
                if (hash) {
                  this.blockHash = hash;
                  return this.apiService.getBlock$(hash);
                } else {
                  return null;
                }
              }),
              catchError((err) => {
                this.error = err;
                this.seoService.logSoft404();
                this.openGraphService.fail('block-data-' + this.rawId);
                this.openGraphService.fail('block-viz-' + this.rawId);
                return of(null);
              }),
            );
        }
        return this.apiService.getBlock$(blockHash);
      }),
      filter((block: BlockExtended | void) => block != null),
      tap((block: BlockExtended) => {
        this.block = block;
        this.blockHeight = block.height;

        this.seoService.setTitle($localize`:@@block.component.browser-title:Block ${block.height}:BLOCK_HEIGHT:: ${block.id}:BLOCK_ID:`);
        this.seoService.setDescription($localize`:@@meta.description.bitcoin.block:See size, weight, fee range, included transactions, audit (expected v actual), and more for Litecoin${seoDescriptionNetwork(this.stateService.network)} block ${block.height}:BLOCK_HEIGHT: (${block.id}:BLOCK_ID:).`);
        this.isLoadingBlock = false;
        this.setBlockSubsidy();
        if (block?.extras?.reward !== undefined) {
          this.fees = block.extras.reward / 100000000 - this.blockSubsidy;
        }
        this.stateService.markBlock$.next({ blockHeight: this.blockHeight });
        this.isLoadingOverview = true;
        this.overviewError = null;

        this.openGraphService.waitOver('block-data-' + this.rawId);
      }),
      throttleTime(50, asyncScheduler, { leading: true, trailing: true }),
      shareReplay(1)
    );

    this.overviewSubscription = block$.pipe(
      startWith(null),
      pairwise(),
      switchMap(([prevBlock, block]) => {
          return forkJoin([
            this.apiService.getStrippedBlockTransactions$(block.id)
              .pipe(
                catchError((err) => {
                  this.overviewError = err;
                  this.openGraphService.fail('block-viz-' + this.rawId);
                  return of([]);
                }),
                switchMap((transactions) => {
                  return of(transactions);
                })
              ),
            this.stateService.env.ACCELERATOR === true && block.height > 819500 ? this.apiService.getAccelerationHistory$({ blockHash: block.id }) : of([])
          ]);
        }
      ),
    )
    .subscribe(([transactions, accelerations]) => {
      this.strippedTransactions = transactions;

      const acceleratedInBlock = {};
      for (const acc of accelerations) {
        acceleratedInBlock[acc.txid] = acc;
      }
      for (const tx of transactions) {
        if (acceleratedInBlock[tx.txid]) {
          tx.acc = true;
        }
      }

      this.isLoadingOverview = false;
      if (this.blockGraph) {
        this.blockGraph.destroy();
        this.blockGraph.setup(this.strippedTransactions);
      }
    },
    (error) => {
      this.error = error;
      this.isLoadingOverview = false;
      this.seoService.logSoft404();
      this.openGraphService.fail('block-viz-' + this.rawId);
      this.openGraphService.fail('block-data-' + this.rawId);
      if (this.blockGraph) {
        this.blockGraph.destroy();
      }
    });

    this.networkChangedSubscription = this.stateService.networkChanged$
      .subscribe((network) => this.network = network);
  }

  ngOnDestroy() {
    if (this.overviewSubscription) {
      this.overviewSubscription.unsubscribe();
    }
    if (this.networkChangedSubscription) {
      this.networkChangedSubscription.unsubscribe();
    }
  }

  // TODO - Refactor this.fees/this.reward for liquid because it is not
  // used anymore on Litecoin networks (we use block.extras directly)
  setBlockSubsidy() {
    this.blockSubsidy = 0;
  }

  onGraphReady(): void {
    this.openGraphService.waitOver('block-viz-' + this.rawId);
  }
}
