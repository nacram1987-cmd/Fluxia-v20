import Foundation
import CryptoKit

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

check(!AuthAccessState.mayReadPersonalData(state: .restoring, requestedOwnerID: "alice"), "session restoration cannot expose personal data")
check(!AuthAccessState.mayReadPersonalData(state: .signedOut, requestedOwnerID: "alice"), "signed-out state cannot expose personal data")
check(!AuthAccessState.mayReadPersonalData(state: .configurationMissing, requestedOwnerID: "alice"), "missing auth configuration fails closed")
check(!AuthAccessState.mayReadPersonalData(state: .authenticated(ownerID: "alice"), requestedOwnerID: "bob"), "authenticated account cannot read another owner's data")
check(AuthAccessState.mayReadPersonalData(state: .authenticated(ownerID: "alice"), requestedOwnerID: "alice"), "authenticated account can address only its own owner namespace")
check(!AuthAccessState.mayReadPersonalData(state: .authenticated(ownerID: " "), requestedOwnerID: " "), "blank authenticated identity fails closed")
check(!AuthAccessState.mayReadPersonalData(state: .authenticated(ownerID: "alice"), requestedOwnerID: nil), "missing requested owner fails closed")
print("Native auth gate: 7 signed-out, missing-config, identity and owner-boundary checks passed")
check(AuthAccessState.isValidConfiguration(url: "https://project.supabase.co", publishableKey: "sb_publishable_synthetic-test"), "synthetic publishable configuration is accepted")
check(!AuthAccessState.isValidConfiguration(url: "http://project.supabase.co", publishableKey: "sb_publishable_synthetic-test"), "insecure HTTP configuration is rejected")
check(!AuthAccessState.isValidConfiguration(url: "https://user:pass@project.supabase.co", publishableKey: "sb_publishable_synthetic-test"), "credential-bearing URL is rejected")
check(!AuthAccessState.isValidConfiguration(url: "https://project.supabase.co", publishableKey: "service_role_fake"), "service-role credential is never accepted as a client key")
check(!AuthAccessState.isValidConfiguration(url: "", publishableKey: ""), "empty auth configuration remains disabled")
print("Native auth configuration: 5 synthetic validation checks passed")


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


let september = MonthlyLedgerProjection.Period(year: 2026, month: 9)!
let october = MonthlyLedgerProjection.Period(year: 2026, month: 10)!
func ledgerEntry(_ id: String, _ month: MonthlyLedgerProjection.Period, _ kind: MonthlyLedgerProjection.Kind,
                 _ cents: Int64, posting: MonthlyLedgerProjection.Posting = .included) -> MonthlyLedgerProjection.Entry {
    .init(id: id, ownerID: "synthetic-user", period: month, kind: kind, amountCents: cents, posting: posting)
}
let historyEntries = [
    ledgerEntry("sep-income", september, .income, 200_000),
    ledgerEntry("sep-fixed", september, .fixedExpense, 50_000),
    ledgerEntry("sep-variable", september, .variableExpense, 30_000),
    ledgerEntry("sep-plan", september, .plannedProvision, 20_000),
    ledgerEntry("sep-contribution", september, .provisionContribution, 25_000),
    ledgerEntry("oct-income", october, .income, 300_000),
    ledgerEntry("oct-fixed", october, .fixedExpense, 40_000),
    ledgerEntry("oct-variable", october, .variableExpense, 10_000),
    ledgerEntry("oct-plan", october, .plannedProvision, 15_000),
    ledgerEntry("sep-excluded", september, .variableExpense, 900_000, posting: .excluded)
]
let septemberProjection = MonthlyLedgerProjection.project(entries: historyEntries, authenticatedOwnerID: "synthetic-user", period: september)
let octoberProjection = MonthlyLedgerProjection.project(entries: historyEntries, authenticatedOwnerID: "synthetic-user", period: october)
check(FinanceRules.availableCents(septemberProjection!) == 95_000,
      "September historical entries and provision excess affect September only")
check(FinanceRules.availableCents(octoberProjection!) == 235_000,
      "October projection excludes September and excluded records")
check(MonthlyLedgerProjection.project(entries: historyEntries, authenticatedOwnerID: nil, period: october) == nil,
      "anonymous monthly projection fails closed")
var mixedOwners = historyEntries
mixedOwners.append(.init(id: "foreign", ownerID: "other-user", period: october, kind: .income, amountCents: 9_000, posting: .included))
check(MonthlyLedgerProjection.project(entries: mixedOwners, authenticatedOwnerID: "synthetic-user", period: october) == nil,
      "mixed-owner input is rejected instead of silently mixing account data")
var duplicateLedgerIDs = historyEntries
duplicateLedgerIDs.append(ledgerEntry("oct-income", september, .income, 1))
check(MonthlyLedgerProjection.project(entries: duplicateLedgerIDs, authenticatedOwnerID: "synthetic-user", period: october) == nil,
      "duplicate record ID across periods is rejected")
var overflowLedger = [
    ledgerEntry("large-a", october, .income, Int64.max),
    ledgerEntry("large-b", october, .income, 1)
]
check(MonthlyLedgerProjection.project(entries: overflowLedger, authenticatedOwnerID: "synthetic-user", period: october) == nil,
      "monthly aggregation rejects Int64 overflow")
check(MonthlyLedgerProjection.Period(year: 2026, month: 13) == nil,
      "invalid month cannot enter the projection")
print("Monthly ledger projection: 7 historical-period, exclusion, identity and overflow checks passed")

let ledgerDirectory = FileManager.default.temporaryDirectory
    .appendingPathComponent("fluxia-ledger-tests-\(UUID().uuidString)", isDirectory: true)
let testKey = SymmetricKey(data: Data(repeating: 0x5a, count: 32))
let encryptedStore = EncryptedLedgerStore(directoryURL: ledgerDirectory, keyProvider: { _ in testKey })
let localEntry = EncryptedLedgerStore.Entry(id: "entry-1", ownerID: "synthetic-user", year: 2026, month: 10,
                                            kind: .variableExpense, amountCents: 1250, operationID: "append-1")
check(try! encryptedStore.append(localEntry, authenticatedOwnerID: "synthetic-user") == .inserted(revision: 1),
      "encrypted local append persists a synthetic entry")
check(try! encryptedStore.append(localEntry, authenticatedOwnerID: "synthetic-user") == .duplicateOperation,
      "replaying an append operation does not duplicate it")
let conflictingReplay = EncryptedLedgerStore.Entry(id: "entry-other", ownerID: "synthetic-user", year: 2026, month: 10,
                                                  kind: .variableExpense, amountCents: 900, operationID: "append-1")
check(try! encryptedStore.append(conflictingReplay, authenticatedOwnerID: "synthetic-user") == .conflictingOperation,
      "reusing an idempotency key for a different payload is surfaced as conflict")
check(try! encryptedStore.entries(ownerID: "synthetic-user", authenticatedOwnerID: "other-user").isEmpty,
      "another authenticated user cannot read this local ledger")
let reopenedStore = EncryptedLedgerStore(directoryURL: ledgerDirectory, keyProvider: { _ in testKey })
check(try! reopenedStore.entries(ownerID: "synthetic-user", authenticatedOwnerID: "synthetic-user") == [localEntry],
      "encrypted ledger survives reopening")
let ledgerFile = try! FileManager.default.contentsOfDirectory(at: ledgerDirectory, includingPropertiesForKeys: nil).first!
let encryptedBytes = try! Data(contentsOf: ledgerFile)
check(String(data: encryptedBytes, encoding: .utf8) == nil,
      "persisted financial snapshot is ciphertext, not plaintext JSON")
check(try! reopenedStore.permanentlyDelete(recordID: "entry-1", ownerID: "synthetic-user", operationID: "delete-1",
                                           authenticatedOwnerID: "synthetic-user") == .inserted(revision: 2),
      "explicit delete writes an audited tombstone")
let attemptedResurrection = EncryptedLedgerStore.Entry(id: "entry-1", ownerID: "synthetic-user", year: 2026, month: 10,
                                                       kind: .variableExpense, amountCents: 1250, operationID: "append-2")
check(try! reopenedStore.append(attemptedResurrection, authenticatedOwnerID: "synthetic-user") == .rejected,
      "a tombstoned record cannot be resurrected by a later append")
check(try! reopenedStore.entries(ownerID: "synthetic-user", authenticatedOwnerID: "synthetic-user").isEmpty,
      "deleted record stays absent after reload")
var corruptedBytes = try! Data(contentsOf: ledgerFile)
corruptedBytes[corruptedBytes.startIndex] ^= 0x01
try! corruptedBytes.write(to: ledgerFile, options: .atomic)
do {
    _ = try reopenedStore.entries(ownerID: "synthetic-user", authenticatedOwnerID: "synthetic-user")
    check(false, "tampered encrypted ledger must not be accepted")
} catch {
    check(true, "authenticated encryption rejects a tampered ledger")
}
print("Encrypted local ledger: 10 synthetic ownership, persistence, encryption, idempotency and tamper checks passed")
