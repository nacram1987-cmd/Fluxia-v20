import Foundation

/// A read-only demonstration snapshot. No network, storage or bank permissions.
struct DemoFinanceSnapshot {
    let month: FinanceRules.Month
    let ownerLabel: String
    let isSynthetic: Bool

    static let preview = DemoFinanceSnapshot(
        month: .init(incomeCents: 250_000, fixedExpenseCents: 70_000,
                     variableExpenseCents: 30_000, plannedProvisionCents: 10_000,
                     actualProvisionContributionCents: 10_000),
        ownerLabel: "Demostración", isSynthetic: true
    )
}

enum FinanceAccessGate {
    /// Never permit live banking or mutation with a synthetic snapshot.
    static func canMutate(_ snapshot: DemoFinanceSnapshot) -> Bool {
        false
    }

    static func canConnectBanks(_ snapshot: DemoFinanceSnapshot) -> Bool {
        false
    }
}
