/**
 * This file is part of the NocoBase (R) project.
 */
import { Field } from '@formily/core';
import { observer, useField, useFieldSchema } from '@formily/react';
import { Plugin, useDesignable, useToken, useIsAllowToSetDefaultValue } from '@nocobase/client';
import { Button, Tooltip } from 'antd';
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
        <Button
          type="text"
          size="small"
          icon={<SaveOutlined />}
          onClick={handleClick}
          style={{ marginLeft: token.marginXXS }}
        />
      </Tooltip>
    );
  },
  {
    displayName: 'SetDefaultValueButton',
  },
);

class PluginSetDefaultValue extends Plugin {
  async load() {
    const setDefaultButton = <SetDefaultValueButton />;

    this.app.addScopes({
      SetDefaultValueButton: setDefaultButton,
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
        return {
          title: t('Display set default button'),
          checked: !!fieldSchema['x-component-props']?.addonAfter,
          onChange: async (checked) => {
            if (checked) {
              field.componentProps.addonAfter = setDefaultButton;
              _.set(fieldSchema, 'x-component-props.addonAfter', '{{SetDefaultValueButton}}');
            } else {
              field.componentProps.addonAfter = null;
              _.unset(fieldSchema, 'x-component-props.addonAfter');
            }
            await dn.emit('patch', {
              schema: {
                'x-uid': fieldSchema['x-uid'],
                'x-component-props': {
                  ...fieldSchema['x-component-props'],
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
