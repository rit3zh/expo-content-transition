import * as React from 'react';
import { memo } from 'react';
import { Text, type TextStyle } from 'react-native';
import { COMPONENT_NAMES } from '../../constants';
import type { INumericText } from '../../interfaces';
import { resolveNumericTextStyle, toDisplayValue, typographyToTextStyle } from '../../utils';

const NumericTextBase: React.FC<INumericText> = ({
  value,
  style,
  ...props
}: INumericText): React.JSX.Element => {
  const { viewStyle, typography, alignment } = resolveNumericTextStyle(style, props);

  const textStyle: TextStyle = {
    ...typographyToTextStyle(typography),
    textAlign: alignment === 'center' ? 'center' : alignment === 'end' ? 'right' : 'left',
  };

  return <Text style={[textStyle, viewStyle as TextStyle]}>{toDisplayValue(value)}</Text>;
};

NumericTextBase.displayName = `${COMPONENT_NAMES.NUMERIC_TEXT}Base`;

const NumericText: React.NamedExoticComponent<INumericText> = memo<INumericText>(NumericTextBase);

export { NumericText };
