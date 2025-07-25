/**
 * This file is part of the NocoBase (R) project.
 */
import { Field } from '@formily/core';
import { observer, useField, useFieldSchema } from '@formily/react';
import { Plugin, useDesignable, useToken, useIsAllowToSetDefaultValue } from '@nocobase/client';
import { Tooltip } from 'antd';
import {
  SaveOutlined,
  DownOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

const NAMESPACE = 'set-default-value';

const getPropName = (component: string) => {
  switch (component) {
    case 'ColorSelect':
      return 'suffix';
    case 'Select':
    case 'TreeSelect':
    case 'AssociationSelect':
    case 'Cascader':
    case 'RemoteSelect':
    case 'CustomSelect':
    case 'DatePicker':
    case 'TimePicker':
      return 'suffixIcon';
    default:
      return 'addonBefore';
  }
};

const getDefaultIcon = (component: string) => {
  switch (component) {
    case 'DatePicker':
      return <CalendarOutlined />;
    case 'TimePicker':
      return <ClockCircleOutlined />;
    default:
      return <DownOutlined />;
  }
};

const SuffixIconWithButton: FC = () => {
  const fieldSchema = useFieldSchema();
  const component = fieldSchema['x-component'];
  const { token } = useToken();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <SetDefaultValueButton />
      <span style={{ marginLeft: token.marginXXS }}>{getDefaultIcon(component)}</span>
    </span>
  );
};

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


class PluginSetDefaultValue extends Plugin {
  async load() {
    const setDefaultButton = <SetDefaultValueButton />;

    this.app.addScopes({
      SetDefaultValueButton: setDefaultButton,
      SuffixIconWithButton: <SuffixIconWithButton />,
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
        const propName = getPropName(component);

        return {
          title: t('Display set default button'),
          checked:
            propName === 'addonBefore'
              ? !!fieldSchema['x-component-props']?.addonBefore
              : !!fieldSchema['x-component-props']?.[propName],
          onChange: async (checked) => {
            if (checked) {
              if (propName === 'addonBefore') {
                field.componentProps.addonBefore = setDefaultButton;
                _.set(
                  fieldSchema,
                  'x-component-props.addonBefore',
                  '{{SetDefaultValueButton}}',
                );
              } else {
                field.componentProps[propName] = <SuffixIconWithButton />;
                _.set(
                  fieldSchema,
                  `x-component-props.${propName}`,
                  '{{SuffixIconWithButton}}',
                );
              }
            } else {
              if (propName === 'addonBefore') {
                field.componentProps.addonBefore = undefined;
                _.unset(fieldSchema, 'x-component-props.addonBefore');
              } else {
                field.componentProps[propName] = undefined;
                _.unset(fieldSchema, `x-component-props.${propName}`);
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
