import Foundation

func check(_ condition: @autoclosure () -> Bool, _ message: String) {
    guard condition() else {
        fputs("FAILED: \(message)\n", stderr)
        exit(1)
    }
}

func month(_ actual: Int64, planned: Int64 = 10_000) -> FinanceRules.Month {
    FinanceRules.Month(incomeCents: 250_000, fixedExpenseCents: 70_000,
                       variableExpenseCents: 30_000, plannedProvisionCents: planned,
                       actualProvisionContributionCents: actual)
}

check(FinanceRules.availableCents(month(10_000)) == 140_000, "planned contribution not charged twice")
check(FinanceRules.availableCents(month(5_000)) == 140_000, "underfunding does not increase Disponible")
check(FinanceRules.availableCents(month(15_000)) == 135_000, "excess contribution reduces Disponible")
check(FinanceRules.availableCents(month(0)) == 140_000, "zero contribution keeps planned deduction")
check(FinanceRules.availableCents(month(-1)) == nil, "negative contributions rejected")
check(FinanceRules.availableCents(month(Int64.max)) == nil, "arithmetic overflow rejected")
print("FinanceRules: 6 native accounting checks passed")
