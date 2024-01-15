import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SeoService } from './seo.service';
import { StateService } from './state.service';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  exclusiveHostName = '.litecoinspace.org';
  subdomain: string | null = null;
  info: object = {};
  statsUrl: string;
  siteId: number;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private apiService: ApiService,
    private seoService: SeoService,
    private stateService: StateService,
    private activatedRoute: ActivatedRoute,
  ) {
    const subdomain = this.document.location.hostname.indexOf(this.exclusiveHostName) > -1
      && this.document.location.hostname.split(this.exclusiveHostName)[0] || false;
    if (subdomain && subdomain.match(/^[A-z0-9-_]+$/)) {
      this.subdomain = subdomain;
      this.fetchSubdomainInfo();
    } else {
      // TODO: clean up later
    }
  }

  getSubdomain(): string {
    return this.subdomain;
  }

  fetchSubdomainInfo(): void {
    this.apiService.getEnterpriseInfo$(this.subdomain).subscribe((info) => {
      this.info = info;
      this.seoService.setEnterpriseTitle(info.title);
    },
    (error) => {
      if (error.status === 404) {
        window.location.href = 'https://litecoinspace.org' + window.location.pathname;
      }
    });
  }

  insertMatomo(siteId?: number): void {
    let statsUrl = '//stats.litecoinspace.org/';

    if (!siteId) {
      switch (this.document.location.hostname) {
        case 'litecoinspace.org':
          statsUrl = '//stats.litecoinspace.org/';
          siteId = 5;
          break;
        default:
          return;
      }
    }

    this.statsUrl = statsUrl;
    this.siteId = siteId;

    // @ts-ignore
    if (window._paq && window['Matomo']) {
      window['Matomo'].addTracker(statsUrl+'m.php', siteId.toString());
      const matomo = this.getMatomo();
      matomo.setDocumentTitle(this.seoService.getTitle());
      matomo.setCustomUrl(this.getCustomUrl());
      matomo.disableCookies();
      matomo.trackPageView();
      matomo.enableLinkTracking();
    } else {
      // @ts-ignore
      const alreadyInitialized = !!window._paq;
      // @ts-ignore
      const _paq = window._paq = window._paq || [];
      _paq.push(['setDocumentTitle', this.seoService.getTitle()]);
      _paq.push(['setCustomUrl', this.getCustomUrl()]);
      _paq.push(['disableCookies']);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      if (alreadyInitialized) {
        _paq.push(['addTracker', statsUrl+'m.php', siteId.toString()]);
      } else {
        (function() {
          _paq.push(['setTrackerUrl', statsUrl+'m.php']);
          _paq.push(['setSiteId', siteId.toString()]);
          const d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          // @ts-ignore
          g.type='text/javascript'; g.async=true; g.src=statsUrl+'m.js'; s.parentNode.insertBefore(g,s);
        })();
      }
    }
  }

  private getMatomo() {
    if (this.siteId != null) {
      return window['Matomo']?.getTracker(this.statsUrl+'m.php', this.siteId);
    }
  }

  goal(id: number) {
    // @ts-ignore
    this.getMatomo()?.trackGoal(id);
  }

  private getCustomUrl(): string {
    let url = window.location.origin + '/';
    let route = this.activatedRoute;
    while (route) {
      const segment = route?.routeConfig?.path;
      if (segment && segment.length) {
        url += segment + '/';
      }
      route = route.firstChild;
    }
    return url;
  }
}
