import Foundation

/// Parses user-entered euro values directly into integer cents, without Double.
enum EuroAmountParser {
    static func cents(from input: String) -> Int64? {
        let value = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty, value.rangeOfCharacter(from: CharacterSet(charactersIn: "-+eE ")) == nil else { return nil }
        let normalized = value.replacingOccurrences(of: ",", with: ".")
        let parts = normalized.split(separator: ".", omittingEmptySubsequences: false)
        guard parts.count <= 2, !parts[0].isEmpty,
              parts.allSatisfy({ !$0.isEmpty && $0.allSatisfy(\.isNumber) }),
              parts.count == 1 || parts[1].count <= 2 else { return nil }
        guard let amount = Decimal(string: normalized, locale: Locale(identifier: "en_US_POSIX")), amount > 0 else { return nil }
        let cents = amount * Decimal(100)
        guard cents <= Decimal(Int64.max) else { return nil }
        var rounded = Decimal()
        var source = cents
        NSDecimalRound(&rounded, &source, 0, .plain)
        guard rounded == cents else { return nil }
        return NSDecimalNumber(decimal: rounded).int64Value
    }
}
