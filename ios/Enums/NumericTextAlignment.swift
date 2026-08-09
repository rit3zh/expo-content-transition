import Foundation

enum NumericTextAlignment: String {
  case leading
  case center
  case trailing

  init(propValue: String?) {
    switch propValue {
    case "center": self = .center
    case "end": self = .trailing
    default: self = .leading
    }
  }
}
