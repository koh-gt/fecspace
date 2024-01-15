import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, merge, Observable, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { WebsocketService } from '../../services/websocket.service';
import { RbfTree } from '../../interfaces/node-api.interface';
import { ApiService } from '../../services/api.service';
import { StateService } from '../../services/state.service';
import { SeoService } from '../../services/seo.service';
import { seoDescriptionNetwork } from '../../shared/common.utils';

@Component({
  selector: 'app-rbf-list',
  templateUrl: './rbf-list.component.html',
  styleUrls: ['./rbf-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RbfList implements OnInit, OnDestroy {
  rbfTrees$: Observable<RbfTree[]>;
  nextRbfSubject = new BehaviorSubject(null);
  urlFragmentSubscription: Subscription;
  fullRbf: boolean;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    public stateService: StateService,
    private websocketService: WebsocketService,
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    this.urlFragmentSubscription = this.route.fragment.subscribe((fragment) => {
      this.fullRbf = (fragment === 'fullrbf');
      this.websocketService.startTrackRbf(this.fullRbf ? 'fullRbf' : 'all');
      this.nextRbfSubject.next(null);
    });

    this.rbfTrees$ = merge(
      this.nextRbfSubject.pipe(
        switchMap(() => {
          return this.apiService.getRbfList$(this.fullRbf);
        }),
        catchError((e) => {
          return EMPTY;
        })
      ),
      this.stateService.rbfLatest$
    )
    .pipe(
      tap(() => {
        this.isLoading = false;
      })
    );

    this.seoService.setTitle($localize`:@@5e3d5a82750902f159122fcca487b07f1af3141f:RBF Replacements`);
    this.seoService.setDescription($localize`:@@meta.description.rbf-list:See the most recent RBF replacements on the Litecoin${seoDescriptionNetwork(this.stateService.network)} network, updated in real-time.`);
  }

  ngOnDestroy(): void {
    this.websocketService.stopTrackRbf();
  }
}
