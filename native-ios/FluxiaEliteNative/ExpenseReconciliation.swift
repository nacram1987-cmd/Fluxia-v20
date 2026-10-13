import Foundation

/// Pure, read-only matching logic. It does not mark payments or mutate storage.
enum ExpenseReconciliation {
    struct Charge: Equatable {
        let id: String
        let description: String
        let cents: Int64
    }

    struct FixedBill: Equatable {
        let id: String
        let description: String
        let expectedCents: Int64
        let alreadyPaid: Bool
    }

    enum Match: Equatable {
        case unique(fixedBillID: String)
        case ambiguous
        case none
    }

    /// Conservative recommendation: never auto-pay a fixed bill on fuzzy evidence.
    /// Requires exact normalized description and exact positive amount.
    static func suggestMatch(charge: Charge, bills: [FixedBill]) -> Match {
        guard charge.cents > 0, !charge.id.isEmpty else { return .none }
        let normalized = normalize(charge.description)
        guard !normalized.isEmpty else { return .none }
        let candidates = bills.filter {
            !$0.alreadyPaid && $0.expectedCents == charge.cents &&
            normalize($0.description) == normalized
        }
        switch candidates.count {
        case 0: return .none
        case 1: return .unique(fixedBillID: candidates[0].id)
        default: return .ambiguous
        }
    }

    private static func normalize(_ value: String) -> String {
        value.folding(options: [.caseInsensitive, .diacriticInsensitive], locale: Locale(identifier: "es_ES"))
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .split(whereSeparator: { $0.isWhitespace })
            .joined(separator: " ")
    }
}
