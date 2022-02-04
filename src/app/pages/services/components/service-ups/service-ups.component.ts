import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of } from 'rxjs';
import { UpsMode } from 'app/enums/ups-mode.enum';
import { choicesToOptions, singleArrayToOptions } from 'app/helpers/options.helper';
import helptext from 'app/helptext/services/components/service-ups';
import { UpsConfigUpdate } from 'app/interfaces/ups-config.interface';
import { numberValidator } from 'app/modules/entity/entity-form/validators/number-validation';
import { FormErrorHandlerService } from 'app/modules/ix-forms/services/form-error-handler.service';
import { DialogService, WebSocketService } from 'app/services';
import { EntityUtils } from '../../../../modules/entity/utils';

@UntilDestroy()
@Component({
  templateUrl: './service-ups.component.html',
  styleUrls: ['./service-ups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceUpsComponent implements OnInit {
  isFormLoading = false;
  isMasterMode = true;

  form = this.fb.group({
    identifier: [null as string, [Validators.required, Validators.pattern(/^[\w|,|\.|\-|_]+$/)]],
    mode: [null as string],
    remotehost: [null as string, Validators.required],
    remoteport: [null as number, [Validators.required, numberValidator()]],
    driver: [null as string, Validators.required],
    port: [null as string, Validators.required],
    monuser: [null as string, Validators.required],
    monpwd: [null as string, Validators.pattern(/^((?![\#|\s]).)*$/)],
    extrausers: [null as string],
    rmonitor: [false],
    shutdown: [null as string],
    shutdowntimer: [null as number, numberValidator()],
    shutdowncmd: [null as unknown],
    powerdown: [false],
    nocommwarntime: [300 as unknown, numberValidator()],
    hostsync: [15, numberValidator()],
    description: [null as string],
    options: [null as string],
    optionsupsd: [null as string],
  });

  readonly helptext = helptext;
  readonly labels = {
    identifier: helptext.ups_identifier_placeholder,
    mode: helptext.ups_mode_placeholder,
    remotehost: helptext.ups_remotehost_placeholder,
    remoteport: helptext.ups_remoteport_placeholder,
    driver: helptext.ups_driver_placeholder,
    port: helptext.ups_port_placeholder,
    monuser: helptext.ups_monuser_placeholder,
    monpwd: helptext.ups_monpwd_placeholder,
    extrausers: helptext.ups_extrausers_placeholder,
    rmonitor: helptext.ups_rmonitor_placeholder,
    shutdown: helptext.ups_shutdown_placeholder,
    shutdowntimer: helptext.ups_shutdowntimer_placeholder,
    shutdowncmd: helptext.ups_shutdowncmd_placeholder,
    powerdown: helptext.ups_powerdown_placeholder,
    nocommwarntime: helptext.ups_nocommwarntime_placeholder,
    hostsync: helptext.ups_hostsync_placeholder,
    description: helptext.ups_description_placeholder,
    options: helptext.ups_options_placeholder,
    optionsupsd: helptext.ups_optionsupsd_placeholder,
  };

  readonly tooltips = {
    identifier: helptext.ups_identifier_tooltip,
    mode: helptext.ups_mode_tooltip,
    remotehost: helptext.ups_remotehost_tooltip,
    remoteport: helptext.ups_remoteport_tooltip,
    driver: helptext.ups_driver_tooltip,
    port: helptext.ups_port_tooltip,
    monuser: helptext.ups_monuser_tooltip,
    monpwd: helptext.ups_monpwd_tooltip,
    extrausers: helptext.ups_extrausers_tooltip,
    rmonitor: helptext.ups_rmonitor_tooltip,
    shutdown: helptext.ups_shutdown_tooltip,
    shutdowntimer: helptext.ups_shutdowntimer_tooltip,
    shutdowncmd: helptext.ups_shutdowncmd_tooltip,
    powerdown: helptext.ups_powerdown_tooltip,
    nocommwarntime: helptext.ups_nocommwarntime_tooltip,
    hostsync: helptext.ups_hostsync_tooltip,
    description: helptext.ups_description_tooltip,
    options: helptext.ups_options_tooltip,
    optionsupsd: helptext.ups_optionsupsd_tooltip,
  };

  readonly modeOptions$ = of(helptext.ups_mode_options);
  readonly driverOptions$ = this.ws.call('ups.driver_choices').pipe(choicesToOptions());
  readonly portOptions$ = this.ws.call('ups.port_choices').pipe(singleArrayToOptions());
  readonly shutdownOptions$ = of(helptext.ups_shutdown_options);

  constructor(
    private ws: WebSocketService,
    private errorHandler: FormErrorHandlerService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isFormLoading = true;
    this.loadConfig();
    this.form.controls['mode'].valueChanges.pipe(untilDestroyed(this)).subscribe((res) => {
      this.isMasterMode = res === UpsMode.Master;
    });
  }

  private loadConfig(): void {
    this.ws.call('ups.config')
      .pipe(untilDestroyed(this))
      .subscribe(
        (config) => {
          this.form.patchValue(config);
          this.isFormLoading = false;
          this.cdr.markForCheck();
        },
        (error) => {
          new EntityUtils().handleWsError(null, error, this.dialogService);
          this.isFormLoading = false;
          this.cdr.markForCheck();
        },
      );
  }

  onSubmit(): void {
    const values = this.form.value;
    const params = {
      ...values,
      remoteport: Number(values.remoteport),
      nocommwarntime: values.nocommwarntime ? Number(values.nocommwarntime) : null,
      shutdowntimer: values.shutdowntimer ? Number(values.shutdowntimer) : null,
      hostsync: values.hostsync ? Number(values.hostsync) : null,
    } as UpsConfigUpdate;

    if (this.isMasterMode) {
      delete params.remoteport;
      delete params.remotehost;
    } else {
      delete params.driver;
    }

    this.isFormLoading = true;
    this.ws.call('ups.update', [params])
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          this.isFormLoading = false;
          this.cdr.markForCheck();
          this.router.navigate(['/services']);
        },
        (error) => {
          this.isFormLoading = false;
          this.errorHandler.handleWsFormError(error, this.form);
          this.cdr.markForCheck();
        },
      );
  }

  onCancel(): void {
    this.router.navigate(['/services']);
  }
}
