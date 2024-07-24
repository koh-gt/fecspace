import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  network = '';
  baseTitle = 'Ferrite Space';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private stateService: StateService,
  ) {
    this.stateService.networkChanged$.subscribe((network) => this.network = network);
  }

  setTitle(newTitle: string): void {
    this.titleService.setTitle(newTitle + ' - ' + this.getTitle());
    this.metaService.updateTag({ property: 'og:title', content: newTitle});
    this.metaService.updateTag({ property: 'twitter:title', content: newTitle});
    this.metaService.updateTag({ property: 'og:meta:ready', content: 'ready'});
  }

  resetTitle(): void {
    this.titleService.setTitle(this.getTitle());
    this.metaService.updateTag({ property: 'og:title', content: this.getTitle()});
    this.metaService.updateTag({ property: 'twitter:title', content: this.getTitle()});
    this.metaService.updateTag({ property: 'og:meta:ready', content: 'ready'});
  }

  setEnterpriseTitle(title: string) {
    this.baseTitle = title + ' - ' + this.baseTitle;
    this.resetTitle();
  }

  getTitle(): string {
    if (this.network === 'testnet')
      return this.baseTitle + ' - Ferrite Testnet';
    return this.baseTitle + ' - ' + (this.network ? this.ucfirst(this.network) : 'Ferrite') + ' Explorer';
  }

  ucfirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
