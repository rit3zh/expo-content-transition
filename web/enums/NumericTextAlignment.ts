enum NumericTextAlignment {
  Leading = 'leading',
  Center = 'center',
  Trailing = 'trailing',
}

const alignmentFromProp = (propValue: string | null | undefined): NumericTextAlignment => {
  switch (propValue) {
    case 'center':
      return NumericTextAlignment.Center;
    case 'end':
      return NumericTextAlignment.Trailing;
    default:
      return NumericTextAlignment.Leading;
  }
};

export { NumericTextAlignment, alignmentFromProp };
