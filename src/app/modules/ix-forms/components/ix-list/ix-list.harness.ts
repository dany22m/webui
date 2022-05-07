import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { IxListItemHarness } from 'app/modules/ix-forms/components/ix-list/ix-list-item/ix-list-item.harness';
import {
  IxFormBasicValueType,
} from 'app/modules/ix-forms/testing/control-harnesses.helpers';

export interface IxListHarnessFilters extends BaseHarnessFilters {
  label: string;
}

export class IxListHarness extends ComponentHarness {
  static hostSelector = 'ix-list';

  getListItems = this.locatorForAll(IxListItemHarness);

  static with(options: IxListHarnessFilters): HarnessPredicate<IxListHarness> {
    return new HarnessPredicate(IxListHarness, options)
      .addOption('label', options.label,
        (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label));
  }

  async getLabelText(): Promise<string> {
    const label = await this.locatorFor('label')();
    return label.text({ exclude: '.required' });
  }

  async pressAddButton(): Promise<void> {
    const button = await this.locatorFor(MatButtonHarness.with({ text: 'Add' }))();
    await button.click();
  }

  async getLastListItem(): Promise<IxListItemHarness> {
    const listItems = await this.getListItems();
    return listItems[listItems.length - 1];
  }

  async getFormValues(): Promise<{ [label: string]: IxFormBasicValueType }[]> {
    const listItems = await this.getListItems();
    const values: { [label: string]: IxFormBasicValueType }[] = [];
    for (const listItem of listItems) {
      const formValues = await listItem.getFormValues();
      values.push(formValues);
    }

    return values;
  }
}
