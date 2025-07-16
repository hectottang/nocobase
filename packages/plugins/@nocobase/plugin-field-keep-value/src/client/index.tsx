import { Plugin, SchemaSettings, useDesignable, useFieldSchema } from '@nocobase/client';
import { Form } from '@formily/core';
import { useTranslation } from 'react-i18next';

export const keepValueFieldSettings = new SchemaSettings({
  name: 'fieldSettings:keepValueAfterSubmit',
  items: [
    {
      name: 'keepValueAfterSubmit',
      type: 'switch',
      useComponentProps() {
        const { t } = useTranslation();
        const fieldSchema = useFieldSchema();
        const { dn } = useDesignable();
        return {
          title: t('Keep value after submit'),
          checked: !!fieldSchema['x-component-props']?.keepValueAfterSubmit,
          onChange(value: boolean) {
            const schema = { ['x-uid']: fieldSchema['x-uid'] } as any;
            fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
            fieldSchema['x-component-props'].keepValueAfterSubmit = value;
            schema['x-component-props'] = fieldSchema['x-component-props'];
            dn.emit('patch', { schema });
            dn.refresh();
          },
        };
      },
    },
  ],
});

export class PluginFieldKeepValueClient extends Plugin {
  async load() {
    this.app.schemaSettingsManager.add(keepValueFieldSettings);

    const oldReset = Form.prototype.reset;
    Form.prototype.reset = async function (...args: any[]) {
      const keepList: { field: any; value: any }[] = [];
      Object.values(this.fields).forEach((f: any) => {
        if (f.componentProps?.keepValueAfterSubmit) {
          keepList.push({ field: f, value: f.value });
        }
      });
      await oldReset.apply(this, args as any);
      keepList.forEach(({ field, value }) => {
        field.setValue(value);
        field.setInitialValue(value);
      });
    };
  }
}

export default PluginFieldKeepValueClient;
