import Foundation

/// Pure accounting projection. No network, persistence or UI side effects.
/// Monetary values use Decimal; source transactions must have stable IDs.
public enum FluxiaLedger {
    public enum Kind: String, Codable, Sendable {
        case income, variableExpense, fixedExpense, plannedProvision, provisionContribution
    }
    public enum Status: String, Codable, Sendable {
        case planned, posted, archived
    }
    public struct Entry: Identifiable, Codable, Sendable {
        public let id: UUID
        public let ownerID: UUID
        public let month: String // YYYY-MM
        public let kind: Kind
        public let status: Status
        public let amount: Decimal
        public let fixedObligationID: UUID?
        public init(id: UUID, ownerID: UUID, month: String, kind: Kind, status: Status, amount: Decimal, fixedObligationID: UUID? = nil) {
            self.id = id; self.ownerID = ownerID; self.month = month
            self.kind = kind; self.status = status; self.amount = amount
            self.fixedObligationID = fixedObligationID
        }
    }
    public struct Totals: Equatable {
        public let income: Decimal
        public let variables: Decimal
        public let fixedPaid: Decimal
        public let plannedProvisions: Decimal
        public let contributed: Decimal
        public let available: Decimal
        public var actualSpending: Decimal { variables + fixedPaid }
    }
    public enum LedgerError: Error {
        case duplicateID, negativeAmount, invalidMonth, invalidReference
    }
    /// Project a single owner's month. An imported variable linked to a paid
    /// fixed obligation is excluded from variable spending (no double count).
    public static func totals(entries: [Entry], ownerID: UUID, month: String) throws -> Totals {
        guard month.range(of: #"^\d{4}-(0[1-9]|1[0-2])$"#, options: .regularExpression) != nil else { throw LedgerError.invalidMonth }
        let scoped = entries.filter { $0.ownerID == ownerID && $0.month == month }
        var seen = Set<UUID>()
        for entry in scoped {
            guard seen.insert(entry.id).inserted else { throw LedgerError.duplicateID }
            guard entry.amount >= 0 else { throw LedgerError.negativeAmount }
        }
        let active = scoped.filter { $0.status != .archived }
        let paidFixed = Set(active.filter { $0.kind == .fixedExpense && $0.status == .posted }.map(\.id))
        var income: Decimal = 0, variables: Decimal = 0, fixed: Decimal = 0
        var provisionPlan: Decimal = 0, contributions: Decimal = 0
        for entry in active {
            switch entry.kind {
            case .income:
                if entry.status == .posted { income += entry.amount }
            case .variableExpense:
                if entry.status == .posted {
                    if let ref = entry.fixedObligationID {
                        guard active.contains(where: { $0.id == ref && $0.kind == .fixedExpense }) else { throw LedgerError.invalidReference }
                        if paidFixed.contains(ref) { continue }
                    }
                    variables += entry.amount
                }
            case .fixedExpense:
                if entry.status == .posted { fixed += entry.amount }
            case .plannedProvision:
                provisionPlan += entry.amount
            case .provisionContribution:
                if entry.status == .posted { contributions += entry.amount }
            }
        }
        // Contributions up to the planned amount do not reduce available twice.
        let excess = max(Decimal.zero, contributions - provisionPlan)
        return Totals(income: income, variables: variables, fixedPaid: fixed,
                      plannedProvisions: provisionPlan, contributed: contributions,
                      available: income - variables - fixed - provisionPlan - excess)
    }
}
