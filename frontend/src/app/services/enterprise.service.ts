import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SeoService } from './seo.service';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  exclusiveHostName = '.litecoinspace.org';
  subdomain: string | null = null;
  info: object = {};

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private apiService: ApiService,
    private seoService: SeoService,
    private stateService: StateService,
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
}
