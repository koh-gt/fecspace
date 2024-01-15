import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Inject, LOCALE_ID, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, merge, of, Subject, Subscription } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { Env, StateService } from '../../../services/state.service';
import { IBackendInfo } from '../../../interfaces/websocket.interface';
import { LanguageService } from '../../../services/language.service';
import { NavigationService } from '../../../services/navigation.service';
import { StorageService } from '../../../services/storage.service';
import { WebsocketService } from '../../../services/websocket.service';

@Component({
  selector: 'app-global-footer',
  templateUrl: './global-footer.component.html',
  styleUrls: ['./global-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalFooterComponent implements OnInit {
  private destroy$: Subject<any> = new Subject<any>();
  env: Env;
  officialMempoolSpace = this.stateService.env.OFFICIAL_MEMPOOL_SPACE;
  backendInfo$: Observable<IBackendInfo>;
  servicesBackendInfo$: Observable<IBackendInfo>;
  frontendGitCommitHash = this.stateService.env.GIT_COMMIT_HASH;
  packetJsonVersion = this.stateService.env.PACKAGE_JSON_VERSION;
  urlLanguage: string;
  network$: Observable<string>;
  networkPaths: { [network: string]: string };
  currentNetwork = '';
  loggedIn = false;
  urlSubscription: Subscription;
  isServicesPage = false;
  servicesEnabled = false;

  constructor(
    public stateService: StateService,
    private languageService: LanguageService,
    private navigationService: NavigationService,
    @Inject(LOCALE_ID) public locale: string,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private websocketService: WebsocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.servicesEnabled = this.officialMempoolSpace && this.stateService.env.ACCELERATOR === true && this.stateService.network === '';
    this.isServicesPage = this.router.url.includes('/services/');

    this.env = this.stateService.env;
    this.backendInfo$ = this.stateService.backendInfo$;
    this.servicesBackendInfo$ = this.stateService.servicesBackendInfo$;
    this.urlLanguage = this.languageService.getLanguageForUrl();
    this.navigationService.subnetPaths.subscribe((paths) => {
      this.networkPaths = paths;
    });
    this.network$ = merge(of(''), this.stateService.networkChanged$).pipe(
      tap((network: string) => {
        return network;
      })
    );
    this.network$.pipe(takeUntil(this.destroy$)).subscribe((network) => {
      this.currentNetwork = network;
    });

    this.urlSubscription = this.route.url.subscribe((url) => {
      this.loggedIn = this.storageService.getAuth() !== null;
      this.cd.markForCheck();
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.urlSubscription.unsubscribe();
  }

  networkLink(network) {
    const thisNetwork = network || 'mainnet';
    if( network === '' || network === 'mainnet' || network === 'testnet' ) {
      return (this.env.BASE_MODULE === 'mempool' ? '' : this.env.MEMPOOL_WEBSITE_URL + this.urlLanguage) + this.networkPaths[thisNetwork] || '/';
    }
  }
}
