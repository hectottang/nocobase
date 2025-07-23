/**
 * This file is part of the NocoBase (R) project.
 */
import { Field } from '@formily/core';
import { observer, useField, useFieldSchema } from '@formily/react';
import { Plugin, useDesignable, useToken, useIsAllowToSetDefaultValue } from '@nocobase/client';
import { Tooltip } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

const NAMESPACE = 'set-default-value';

const SetDefaultValueButton: FC = observer(
  () => {
    const field = useField<Field>();
    const fieldSchema = useFieldSchema();
    const { dn } = useDesignable();
    const { token } = useToken();
    const { t } = useTranslation(NAMESPACE);

    const handleClick = async () => {
      fieldSchema.default = field.value;
      field.setInitialValue?.(field.value);
      await dn.emit('patch', {
        schema: {
          'x-uid': fieldSchema['x-uid'],
          default: field.value,
        },
      });
      dn.refresh();
    };

    return (
      <Tooltip title={t('Set as default value')}>
        <SaveOutlined
          onClick={handleClick}
          style={{ marginRight: token.marginXXS, cursor: 'pointer' }}
        />
      </Tooltip>
    );
  },
  {
    displayName: 'SetDefaultValueButton',
  },
);

const renderWithButton = (children: React.ReactNode) => {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <SetDefaultValueButton />
      {children}
    </span>
  );
};

class PluginSetDefaultValue extends Plugin {
  async load() {
    const setDefaultButton = <SetDefaultValueButton />;

    this.app.addScopes({
      SetDefaultValueButton: setDefaultButton,
      renderWithButton,
    });

    this.app.schemaSettingsManager.addItem('fieldSettings:FormItem', 'enableSetDefault', {
      type: 'switch',
      useVisible() {
        const { isAllowToSetDefaultValue } = useIsAllowToSetDefaultValue();
        return isAllowToSetDefaultValue();
      },
      useComponentProps() {
        const { t } = useTranslation(NAMESPACE);
        const fieldSchema = useFieldSchema();
        const field = useField();
        const { dn } = useDesignable();

        const component = fieldSchema['x-component'];
        const renderOnly = [
          'Select',
          'TreeSelect',
          'AssociationSelect',
          'Cascader',
          'RemoteSelect',
          'CustomSelect',
          'DatePicker',
          'TimePicker',
          'ColorSelect',
        ].includes(component);

        return {
          title: t('Display set default button'),
          checked: renderOnly
            ? !!fieldSchema['x-decorator-props']?.render
            : !!fieldSchema['x-component-props']?.addonBefore,
          onChange: async (checked) => {
            if (checked) {
              if (renderOnly) {
                field.decoratorProps.render = renderWithButton;
                _.set(fieldSchema, 'x-decorator-props.render', '{{renderWithButton}}');
              } else {
                field.componentProps.addonBefore = setDefaultButton;
                _.set(fieldSchema, 'x-component-props.addonBefore', '{{SetDefaultValueButton}}');
              }
            } else {
              if (renderOnly) {
                field.decoratorProps.render = undefined;
                _.unset(fieldSchema, 'x-decorator-props.render');
              } else {
                field.componentProps.addonBefore = undefined;
                _.unset(fieldSchema, 'x-component-props.addonBefore');
              }
            }
            await dn.emit('patch', {
              schema: {
                'x-uid': fieldSchema['x-uid'],
                'x-component-props': {
                  ...fieldSchema['x-component-props'],
                },
                'x-decorator-props': {
                  ...fieldSchema['x-decorator-props'],
                },
              },
            });
          },
        };
      },
    });
  }
}

export default PluginSetDefaultValue;
