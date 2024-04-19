import {
  ChangeDetectionStrategy, Component, Inject,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Role } from 'app/enums/role.enum';
import { WINDOW } from 'app/helpers/window.helper';
import { helptextTopbar } from 'app/helptext/topbar';

@Component({
  selector: 'ix-truecommand-signup-modal',
  templateUrl: './truecommand-signup-modal.component.html',
  styleUrls: ['./truecommand-signup-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TruecommandSignupModalComponent {
  readonly helptext = helptextTopbar;
  protected readonly requiredRoles = [Role.TrueCommandWrite];

  constructor(
    private dialogRef: MatDialogRef<TruecommandSignupModalComponent>,
    @Inject(WINDOW) private window: Window,
  ) { }

  onSignup(): void {
    this.window.open('https://portal.ixsystems.com');
    this.dialogRef.close(false);
  }
}
