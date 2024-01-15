import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { StateService } from '../../services/state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rate-unit-selector',
  templateUrl: './rate-unit-selector.component.html',
  styleUrls: ['./rate-unit-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RateUnitSelectorComponent implements OnInit, OnDestroy {
  rateUnitForm: UntypedFormGroup;
  rateUnitSub: Subscription;
  units = [
    { name: 'vb', label: 'lit/vB' },
    { name: 'wu', label: 'lit/WU' },
  ];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private stateService: StateService,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.rateUnitForm = this.formBuilder.group({
      rateUnits: ['vb']
    });
    this.rateUnitSub = this.stateService.rateUnits$.subscribe((units) => {
      this.rateUnitForm.get('rateUnits')?.setValue(units);
    });
  }

  changeUnits() {
    const newUnits = this.rateUnitForm.get('rateUnits')?.value;
    this.storageService.setValue('rate-unit-preference', newUnits);
    this.stateService.rateUnits$.next(newUnits);
  }

  ngOnDestroy(): void {
    this.rateUnitSub.unsubscribe();
  }
}
