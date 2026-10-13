import Foundation

/// Pure accounting rules. All monetary values are integer euro cents.
/// This module never reads or writes bank, authentication or cloud data.
enum FinanceRules {
    struct Month: Equatable {
        let incomeCents: Int64
        let fixedExpenseCents: Int64
        let variableExpenseCents: Int64
        let plannedProvisionCents: Int64
        let actualProvisionContributionCents: Int64

        init(incomeCents: Int64, fixedExpenseCents: Int64, variableExpenseCents: Int64,
             plannedProvisionCents: Int64, actualProvisionContributionCents: Int64) {
            self.incomeCents = incomeCents
            self.fixedExpenseCents = fixedExpenseCents
            self.variableExpenseCents = variableExpenseCents
            self.plannedProvisionCents = plannedProvisionCents
            self.actualProvisionContributionCents = actualProvisionContributionCents
        }
    }

    /// Disponible = ingresos - gastos - provisiones previstas
    ///              - exceso de aportaciones sobre lo previsto.
    /// Aportar menos de lo previsto NO incrementa Disponible.
    static func availableCents(_ month: Month) -> Int64? {
        let amounts = [month.incomeCents, month.fixedExpenseCents, month.variableExpenseCents,
                       month.plannedProvisionCents, month.actualProvisionContributionCents]
        guard amounts.allSatisfy({ $0 >= 0 }) else { return nil }
        let excess = max(0, month.actualProvisionContributionCents - month.plannedProvisionCents)
        let (expenses, overflow1) = month.fixedExpenseCents.addingReportingOverflow(month.variableExpenseCents)
        let (planned, overflow2) = month.plannedProvisionCents.addingReportingOverflow(excess)
        let (deductions, overflow3) = expenses.addingReportingOverflow(planned)
        let (available, overflow4) = month.incomeCents.subtractingReportingOverflow(deductions)
        guard !overflow1 && !overflow2 && !overflow3 && !overflow4 else { return nil }
        return available
    }
}
