import * as React from 'react';
import { memo } from 'react';
import { COMPONENT_NAMES } from '../../constants';
import type { INumericText } from '../../interfaces';
import { resolveNumericTextStyle, toDisplayValue, toSeconds } from '../../utils';
import { NativeNumericTextView } from '../../views';

const NumericTextBase: React.FC<INumericText> & React.FunctionComponent<INumericText> = ({
  value,
  style,
  duration,
  ...props
}: INumericText): React.JSX.Element & React.ReactElement & React.ReactNode => {
  const { viewStyle, typography, alignment } = resolveNumericTextStyle(style, props);

  return (
    <NativeNumericTextView
      {...typography}
      value={toDisplayValue(value)}
      alignment={alignment ?? null}
      decimalSeparator={props.decimalSeparator ?? null}
      direction={props.direction ?? null}
      duration={toSeconds(duration)}
      bounce={props.bounce ?? null}
      enterScale={props.enterScale ?? null}
      travel={props.travel ?? null}
      blur={props.blur ?? null}
      blurIntensity={props.blurIntensity ?? null}
      maxBlurRadius={props.maxBlurRadius ?? null}
      clip={props.clip ?? null}
      animated={props.animated ?? null}
      style={viewStyle}
    />
  );
};

NumericTextBase.displayName = `${COMPONENT_NAMES.NUMERIC_TEXT}Base`;

const NumericText: React.NamedExoticComponent<INumericText> = memo<INumericText>(NumericTextBase);

export { NumericText };
