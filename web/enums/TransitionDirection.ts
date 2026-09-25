enum TransitionDirection {
  Auto = 'auto',
  Up = 'up',
  Down = 'down',
}

const directionFromProp = (propValue: string | null | undefined): TransitionDirection => {
  switch (propValue) {
    case 'up':
      return TransitionDirection.Up;
    case 'down':
      return TransitionDirection.Down;
    default:
      return TransitionDirection.Auto;
  }
};

export { TransitionDirection, directionFromProp };
