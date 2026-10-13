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
    static func classify(_ incoming: Movement, existing: [Movement]) -> Decision {
        guard !incoming.provider.isEmpty,
              !incoming.accountID.isEmpty,
              !incoming.providerTransactionID.isEmpty,
              incoming.amountCents != 0 else { return .needsReview }

        let matches = existing.filter {
            $0.provider == incoming.provider &&
            $0.accountID == incoming.accountID &&
            $0.providerTransactionID == incoming.providerTransactionID
        }
        if matches.isEmpty { return .new }
        // Conflicting historical amounts must never be silently deduplicated.
        if matches.contains(where: { $0.amountCents != incoming.amountCents }) { return .conflict }
        return .duplicate
    }
}
