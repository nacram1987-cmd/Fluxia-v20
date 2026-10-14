import Foundation

/// Pure deduplication policy. This never mutates user records.
enum BankImportSafety {
    struct Movement: Equatable {
        let provider: String
        let accountID: String
        let providerTransactionID: String
        let amountCents: Int64
    }

    enum Decision: Equatable {
        case new
        case duplicate
        case conflict
        case needsReview
    }

    /// Provider transaction IDs are scoped to both provider and account.
    /// A reused ID with changed amount is a conflict, not a new expense.
    private static func canonicalIdentity(_ value: String) -> String {
        value.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private static func hasNonWhitespaceValue(_ value: String) -> Bool {
        !canonicalIdentity(value).isEmpty
    }

    static func classify(_ incoming: Movement, existing: [Movement]) -> Decision {
        guard hasNonWhitespaceValue(incoming.provider),
              hasNonWhitespaceValue(incoming.accountID),
              hasNonWhitespaceValue(incoming.providerTransactionID),
              incoming.amountCents != 0 else { return .needsReview }

        let matches = existing.filter {
            canonicalIdentity($0.provider) == canonicalIdentity(incoming.provider) &&
            canonicalIdentity($0.accountID) == canonicalIdentity(incoming.accountID) &&
            canonicalIdentity($0.providerTransactionID) == canonicalIdentity(incoming.providerTransactionID)
        }
        if matches.isEmpty { return .new }
        // Conflicting historical amounts must never be silently deduplicated.
        if matches.contains(where: { $0.amountCents != incoming.amountCents }) { return .conflict }
        return .duplicate
    }
}
