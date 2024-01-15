import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { StateService } from '../../services/state.service';
import { SeoService } from '../../services/seo.service';
import { seoDescriptionNetwork } from '../../shared/common.utils';

@Component({
  selector: 'app-push-transaction',
  templateUrl: './push-transaction.component.html',
  styleUrls: ['./push-transaction.component.scss']
})
export class PushTransactionComponent implements OnInit {
  pushTxForm: UntypedFormGroup;
  error: string = '';
  txId: string = '';
  isLoading = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private apiService: ApiService,
    public stateService: StateService,
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    this.pushTxForm = this.formBuilder.group({
      txHash: ['', Validators.required],
    });

    this.seoService.setTitle($localize`:@@meta.title.push-tx:Broadcast Transaction`);
    this.seoService.setDescription($localize`:@@meta.description.push-tx:Broadcast a transaction to the ${'Litecoin'}${seoDescriptionNetwork(this.stateService.network)} network using the transaction's hash.`);
  }

  postTx() {
    this.isLoading = true;
    this.error = '';
    this.txId = '';
    this.apiService.postTransaction$(this.pushTxForm.get('txHash').value)
      .subscribe((result) => {
        this.isLoading = false;
        this.txId = result;
        this.pushTxForm.reset();
      },
      (error) => {
        if (typeof error.error === 'string') {
          const matchText = error.error.match('"message":"(.*?)"');
          this.error = matchText && matchText[1] || error.error;
        } else if (error.message) {
          this.error = error.message;
        }
        this.isLoading = false;
      });
  }

}
