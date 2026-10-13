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

let demo = DemoFinanceSnapshot.preview
check(demo.isSynthetic, "preview must always be labelled synthetic")
check(!FinanceAccessGate.canMutate(demo), "demo cannot write financial records")
check(!FinanceAccessGate.canConnectBanks(demo), "demo cannot connect banking accounts")
check(FinanceRules.availableCents(demo.month) == 140_000, "demo balance must derive from engine")
print("Demo safety: 4 checks passed")

let endesa = ExpenseReconciliation.FixedBill(id: "fixed-1", description: "Endesa", expectedCents: 6_200, alreadyPaid: false)
let charge = ExpenseReconciliation.Charge(id: "bank-1", description: " ENDESA ", cents: 6_200)
check(ExpenseReconciliation.suggestMatch(charge: charge, bills: [endesa]) == .unique(fixedBillID: "fixed-1"), "exact name and amount can match")
check(ExpenseReconciliation.suggestMatch(charge: .init(id: "bank-1", description: "Endesa", cents: 6_300), bills: [endesa]) == .none, "different amount must not match")
check(ExpenseReconciliation.suggestMatch(charge: charge, bills: [.init(id: "fixed-1", description: "Endesa", expectedCents: 6_200, alreadyPaid: true)]) == .none, "paid bills cannot rematch")
check(ExpenseReconciliation.suggestMatch(charge: charge, bills: [endesa, .init(id: "fixed-2", description: "Endesa", expectedCents: 6_200, alreadyPaid: false)]) == .ambiguous, "duplicate candidates require review")
check(ExpenseReconciliation.suggestMatch(charge: .init(id: "bank-1", description: "Endesa", cents: 0), bills: [endesa]) == .none, "zero amount must not match")
print("Expense reconciliation: 5 checks passed")

let movement = BankImportSafety.Movement(provider: "bank-a", accountID: "account-1", providerTransactionID: "tx-100", amountCents: -6_200)
check(BankImportSafety.classify(movement, existing: []) == .new, "unseen movement is new")
check(BankImportSafety.classify(movement, existing: [movement]) == .duplicate, "reimport must not duplicate")
check(BankImportSafety.classify(.init(provider: "bank-a", accountID: "account-1", providerTransactionID: "tx-100", amountCents: -6_300), existing: [movement]) == .conflict, "same provider ID with different amount must be flagged")
check(BankImportSafety.classify(.init(provider: "bank-a", accountID: "account-2", providerTransactionID: "tx-100", amountCents: -6_200), existing: [movement]) == .new, "transaction IDs are scoped per account")
check(BankImportSafety.classify(.init(provider: "bank-b", accountID: "account-1", providerTransactionID: "tx-100", amountCents: -6_200), existing: [movement]) == .new, "transaction IDs are scoped per provider")
check(BankImportSafety.classify(.init(provider: "bank-a", accountID: "account-1", providerTransactionID: "", amountCents: -6_200), existing: []) == .needsReview, "missing provider transaction ID must not be imported blindly")
print("Bank import safety: 6 checks passed")
