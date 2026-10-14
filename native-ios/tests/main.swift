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

var accountingCases = 0
for income in [Int64(0), 1, 25_000, 250_000] {
    for fixed in [Int64(0), 6_200, 70_000] {
        for variable in [Int64(0), 3_000, 30_000] {
            for planned in [Int64(0), 500, 10_000] {
                for actual in [Int64(0), planned / 2, planned, planned + 500] {
                    let input = FinanceRules.Month(
                        incomeCents: income, fixedExpenseCents: fixed,
                        variableExpenseCents: variable, plannedProvisionCents: planned,
                        actualProvisionContributionCents: actual
                    )
                    let expected = income - fixed - variable - planned - max(0, actual - planned)
                    check(FinanceRules.availableCents(input) == expected,
                          "Disponible formula mismatch across deterministic amount combinations")
                    accountingCases += 1
                }
            }
        }
    }
}
check(accountingCases == 432, "all deterministic Disponible combinations executed")
print("FinanceRules: 432 additional deterministic amount combinations passed")

let demo = DemoFinanceSnapshot.preview
check(demo.isSynthetic, "preview must always be labelled synthetic")
check(!FinanceAccessGate.canMutate(demo), "demo cannot write financial records")
check(!FinanceAccessGate.canConnectBanks(demo), "demo cannot connect banking accounts")
check(FinanceRules.availableCents(demo.month) == 140_000, "demo balance must derive from engine")
print("Demo safety: 4 checks passed")

let endesa = ExpenseReconciliation.FixedBill(id: "fixed-1", description: "Endesa", expectedCents: 6_200, alreadyPaid: false)
let charge = ExpenseReconciliation.Charge(id: "bank-1", description: " ENDESA ", cents: 6_200)
check(ExpenseReconciliation.suggestMatch(charge: charge, bills: [endesa]) == .unique(fixedBillID: "fixed-1"), "exact name and amount can match")
check(ExpenseReconciliation.suggestMatch(charge: .init(id: "  ", description: "Endesa", cents: 6_200), bills: [endesa]) == .none, "whitespace-only bank charge ID cannot be reconciled")
check(ExpenseReconciliation.suggestMatch(charge: charge, bills: [.init(id: "  ", description: "Endesa", expectedCents: 6_200, alreadyPaid: false)]) == .none, "whitespace-only fixed bill ID cannot be reconciled")
check(ExpenseReconciliation.suggestMatch(charge: .init(id: "bank-1", description: "Endesa", cents: 6_300), bills: [endesa]) == .none, "different amount must not match")
check(ExpenseReconciliation.suggestMatch(charge: charge, bills: [.init(id: "fixed-1", description: "Endesa", expectedCents: 6_200, alreadyPaid: true)]) == .none, "paid bills cannot rematch")
check(ExpenseReconciliation.suggestMatch(charge: charge, bills: [endesa, .init(id: "fixed-2", description: "Endesa", expectedCents: 6_200, alreadyPaid: false)]) == .ambiguous, "duplicate candidates require review")
check(ExpenseReconciliation.suggestMatch(charge: .init(id: "bank-1", description: "Endesa", cents: 0), bills: [endesa]) == .none, "zero amount must not match")
print("Expense reconciliation: 7 checks passed")

let movement = BankImportSafety.Movement(provider: "bank-a", accountID: "account-1", providerTransactionID: "tx-100", amountCents: -6_200)
check(BankImportSafety.classify(movement, existing: []) == .new, "unseen movement is new")
check(BankImportSafety.classify(movement, existing: [movement]) == .duplicate, "reimport must not duplicate")
check(BankImportSafety.classify(.init(provider: "bank-a", accountID: "account-1", providerTransactionID: "tx-100", amountCents: -6_300), existing: [movement]) == .conflict, "same provider ID with different amount must be flagged")
check(BankImportSafety.classify(.init(provider: "bank-a", accountID: "account-2", providerTransactionID: "tx-100", amountCents: -6_200), existing: [movement]) == .new, "transaction IDs are scoped per account")
check(BankImportSafety.classify(.init(provider: "bank-b", accountID: "account-1", providerTransactionID: "tx-100", amountCents: -6_200), existing: [movement]) == .new, "transaction IDs are scoped per provider")
check(BankImportSafety.classify(.init(provider: "bank-a", accountID: "account-1", providerTransactionID: "", amountCents: -6_200), existing: []) == .needsReview, "missing provider transaction ID must not be imported blindly")
check(BankImportSafety.classify(.init(provider: "bank-a", accountID: "account-1", providerTransactionID: "tx-101", amountCents: -6_200), existing: [movement]) == .new, "same amount with a different provider transaction ID stays distinct")
check(BankImportSafety.classify(.init(provider: "bank-a", accountID: "account-1", providerTransactionID: "   ", amountCents: -6_200), existing: []) == .needsReview, "whitespace-only bank transaction ID is rejected")
let paddedMovement = BankImportSafety.Movement(provider: " bank-a ", accountID: " account-1", providerTransactionID: " tx-100 ", amountCents: -6_200)
check(BankImportSafety.classify(paddedMovement, existing: [movement]) == .duplicate, "surrounding whitespace cannot bypass transaction deduplication")
check(BankImportSafety.classify(.init(provider: " bank-a ", accountID: "account-1", providerTransactionID: "tx-100 ", amountCents: -6_300), existing: [movement]) == .conflict, "trimmed identity with changed amount remains a conflict")

let syntheticBatch: [BankImportSafety.Movement] = (0..<400).map { index in
    BankImportSafety.Movement(
        provider: "synthetic-bank", accountID: "synthetic-account",
        providerTransactionID: "synthetic-tx-\(index)",
        amountCents: -Int64((index % 83) + 1) * 100
    )
}
var importedBatch: [BankImportSafety.Movement] = []
var duplicateDecisions = 0
for _ in 0..<10 {
    for transaction in syntheticBatch {
        switch BankImportSafety.classify(transaction, existing: importedBatch) {
        case .new:
            importedBatch.append(transaction)
        case .duplicate:
            duplicateDecisions += 1
        case .conflict, .needsReview:
            check(false, "stable synthetic transaction unexpectedly conflicted on replay")
        }
    }
}
check(importedBatch.count == 400, "400 synthetic provider IDs remain unique after ten import passes")
check(duplicateDecisions == 3_600, "the next nine reimports classify every existing transaction as duplicate")
print("Bank import safety: 400 synthetic IDs across 10 passes; 400 unique, 3,600 duplicate decisions")

let aliceRecord = AccountIsolation.Record(id: "r-1", ownerID: "alice", amountCents: 2_000)
let bobRecord = AccountIsolation.Record(id: "r-2", ownerID: "bob", amountCents: 3_000)
check(AccountIsolation.authorize(record: aliceRecord, authenticatedUserID: "alice") == .allowed, "owner can access own record")
check(AccountIsolation.authorize(record: aliceRecord, authenticatedUserID: "bob") == .denied, "other user cannot access record")
check(AccountIsolation.authorize(record: aliceRecord, authenticatedUserID: nil) == .denied, "anonymous user cannot access record")
check(AccountIsolation.authorize(record: aliceRecord, authenticatedUserID: " ") == .denied, "blank session cannot access record")
check(AccountIsolation.authorize(record: .init(id: "r-3", ownerID: "  ", amountCents: 1), authenticatedUserID: "  ") == .denied, "whitespace-only record owner fails closed")
check(AccountIsolation.authorize(record: .init(id: "  ", ownerID: "alice", amountCents: 1), authenticatedUserID: "alice") == .denied, "whitespace-only record ID fails closed")
check(AccountIsolation.visibleRecords([aliceRecord, bobRecord], authenticatedUserID: "alice") == [aliceRecord], "user sees only own records")
check(AccountIsolation.visibleRecords([aliceRecord, bobRecord], authenticatedUserID: nil).isEmpty, "signed-out user sees no records")
print("Account isolation: 8 checks passed")


var lifecycle = LedgerLifecycle.Record(id: "ledger-1", ownerID: "synthetic-user")
let archived = lifecycle.apply(.archive, operationID: "op-1", authenticatedOwnerID: "synthetic-user")
check(archived.disposition == .applied && archived.state == .archived && archived.revision == 1,
      "active record archives and increments revision")
check(archived.event?.previousState == .active && archived.event?.resultingState == .archived,
      "lifecycle mutation records an auditable before/after event")
let replayedArchive = lifecycle.apply(.archive, operationID: "op-1", authenticatedOwnerID: "synthetic-user")
check(replayedArchive.disposition == .duplicateOperation && lifecycle.revision == 1 && lifecycle.auditTrail.count == 1,
      "replaying an operation is idempotent and does not append audit events")
let crossOwnerMutation = lifecycle.apply(.moveToTrash, operationID: "op-2", authenticatedOwnerID: "other-user")
check(crossOwnerMutation.disposition == .rejected && lifecycle.state == .archived,
      "a different owner cannot mutate a record")
let trashed = lifecycle.apply(.moveToTrash, operationID: "op-3", authenticatedOwnerID: "synthetic-user")
check(trashed.disposition == .applied && trashed.state == .trashed,
      "archived record can move to trash")
let restored = lifecycle.apply(.restore, operationID: "op-4", authenticatedOwnerID: "synthetic-user")
check(restored.disposition == .applied && restored.state == .active && lifecycle.auditTrail.count == 3,
      "explicit restore recovers a trashed record with its audit history")
let movedAgain = lifecycle.apply(.moveToTrash, operationID: "op-5", authenticatedOwnerID: "synthetic-user")
let deleted = lifecycle.apply(.permanentlyDelete, operationID: "op-6", authenticatedOwnerID: "synthetic-user")
check(movedAgain.state == .trashed && deleted.state == .deleted,
      "permanent deletion leaves a terminal tombstone")
let resurrection = lifecycle.apply(.restore, operationID: "op-7", authenticatedOwnerID: "synthetic-user")
check(resurrection.disposition == .rejected && resurrection.state == .deleted,
      "deleted record cannot be resurrected by restore")
let invalidIdentity = LedgerLifecycle.Record(id: " ", ownerID: "synthetic-user")
var invalidCopy = invalidIdentity
check(invalidCopy.apply(.archive, operationID: "op-8", authenticatedOwnerID: "synthetic-user").disposition == .rejected,
      "whitespace-only record identity fails closed")
check(invalidCopy.apply(.archive, operationID: " ", authenticatedOwnerID: "synthetic-user").disposition == .rejected,
      "whitespace-only operation key fails closed")
print("Ledger lifecycle: 10 synthetic state, ownership, audit and replay checks passed")
