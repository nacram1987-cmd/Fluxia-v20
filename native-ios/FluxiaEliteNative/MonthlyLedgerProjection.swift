import Foundation

/// Projects an explicitly classified set of ledger entries into one accounting month.
/// This pure calculation has no persistence, clock, authentication, or bank-provider access.
enum MonthlyLedgerProjection {
    struct Period: Equatable, Hashable {
        let year: Int
        let month: Int

        init?(year: Int, month: Int) {
            guard (1...9999).contains(year), (1...12).contains(month) else { return nil }
            self.year = year
            self.month = month
        }
    }

    enum Kind: Equatable {
        case income
        case fixedExpense
        case variableExpense
        case plannedProvision
        case provisionContribution
    }

    /// Posting is supplied by the caller. Archiving or trashing must not silently
    /// change whether an entry affects finances; that policy needs explicit review.
    enum Posting: Equatable {
        case included
        case excluded
    }

    struct Entry: Equatable {
        let id: String
        let ownerID: String
        let period: Period
        let kind: Kind
        let amountCents: Int64
        let posting: Posting
    }

    /// Fails closed on anonymous/mixed-owner input, malformed IDs, duplicate IDs,
    /// non-positive amounts, or integer overflow. Only explicitly included entries
    /// from the requested period are summed.
    static func project(
        entries: [Entry],
        authenticatedOwnerID: String?,
        period: Period
    ) -> FinanceRules.Month? {
        guard let authenticatedOwnerID, hasValue(authenticatedOwnerID) else { return nil }

        var identifiers = Set<String>()
        var income: Int64 = 0
        var fixed: Int64 = 0
        var variable: Int64 = 0
        var planned: Int64 = 0
        var contributions: Int64 = 0

        for entry in entries {
            guard hasValue(entry.id), hasValue(entry.ownerID),
                  entry.ownerID == authenticatedOwnerID,
                  entry.amountCents > 0,
                  identifiers.insert(entry.id).inserted else { return nil }
            guard entry.posting == .included, entry.period == period else { continue }

            switch entry.kind {
            case .income:
                guard let total = add(income, entry.amountCents) else { return nil }
                income = total
            case .fixedExpense:
                guard let total = add(fixed, entry.amountCents) else { return nil }
                fixed = total
            case .variableExpense:
                guard let total = add(variable, entry.amountCents) else { return nil }
                variable = total
            case .plannedProvision:
                guard let total = add(planned, entry.amountCents) else { return nil }
                planned = total
            case .provisionContribution:
                guard let total = add(contributions, entry.amountCents) else { return nil }
                contributions = total
            }
        }

        return FinanceRules.Month(
            incomeCents: income,
            fixedExpenseCents: fixed,
            variableExpenseCents: variable,
            plannedProvisionCents: planned,
            actualProvisionContributionCents: contributions
        )
    }

    private static func hasValue(_ value: String) -> Bool {
        !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private static func add(_ lhs: Int64, _ rhs: Int64) -> Int64? {
        let (result, overflow) = lhs.addingReportingOverflow(rhs)
        return overflow ? nil : result
    }
}
