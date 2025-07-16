import { Plugin } from '@nocobase/client';
import { useDesignable, useField, useFieldSchema } from '@nocobase/client';
import { useTranslation } from 'react-i18next';

export class PluginFieldKeepValueClient extends Plugin {
  async load() {
    this.schemaSettingsManager.addItem('fieldSettings:FormItem.decoratorOptions', 'keepValueAfterSubmit', {
      type: 'switch',
      useComponentProps() {
        const { t } = useTranslation();
        const { dn } = useDesignable();
        const field = useField();
        const fieldSchema = useFieldSchema();
        return {
          title: t('Preserve value after submission'),
          checked: fieldSchema['x-component-props']?.retainValue ?? false,
          onChange(checked: boolean) {
            fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
            fieldSchema['x-component-props'].retainValue = checked;
            field.componentProps = field.componentProps || {};
            field.componentProps.retainValue = checked;
            dn.emit('patch', {
              schema: {
                'x-uid': fieldSchema['x-uid'],
                'x-component-props': fieldSchema['x-component-props'],
              },
            });
            dn.refresh();
          },
        };
      },
    });
  }
}

export default PluginFieldKeepValueClient;
