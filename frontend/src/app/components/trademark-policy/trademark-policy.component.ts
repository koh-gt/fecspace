import { Component } from '@angular/core';
import { Env, StateService } from '../../services/state.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-trademark-policy',
  templateUrl: './trademark-policy.component.html',
  styleUrls: ['./trademark-policy.component.scss']
})
export class TrademarkPolicyComponent {
  officialMempoolSpace = this.stateService.env.OFFICIAL_MEMPOOL_SPACE;

  constructor(
    private stateService: StateService,
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    this.seoService.setTitle('Trademark Policy');
    this.seoService.setDescription('An overview of the trademarks.');
  }
}
