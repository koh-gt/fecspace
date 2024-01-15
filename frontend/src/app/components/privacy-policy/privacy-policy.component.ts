import { Component } from '@angular/core';
import { Env, StateService } from '../../services/state.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  officialMempoolSpace = this.stateService.env.OFFICIAL_MEMPOOL_SPACE;

  constructor(
    private stateService: StateService,
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    this.seoService.setTitle('Privacy Policy');
    this.seoService.setDescription('Trusted third parties are security holes, as are trusted first parties...you should only trust your own self-hosted instance of Litecoin Space.');
  }
}
