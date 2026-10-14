import XCTest
@testable import FluxiaNativeCore

final class FluxiaLedgerTests: XCTestCase {
    let owner = UUID()
    let other = UUID()
    let month = "2026-10"

    func entry(_ kind: FluxiaLedger.Kind, _ amount: Int, status: FluxiaLedger.Status = .posted,
               ownerID: UUID? = nil, fixedID: UUID? = nil, id: UUID = UUID()) -> FluxiaLedger.Entry {
        .init(id: id, ownerID: ownerID ?? owner, month: month, kind: kind, status: status,
              amount: Decimal(amount), fixedObligationID: fixedID)
    }

    func testAvailableWithPlannedAndExcessContributions() throws {
        let entries = [entry(.income, 2500), entry(.variableExpense, 200),
                       entry(.fixedExpense, 500), entry(.plannedProvision, 100),
                       entry(.provisionContribution, 130)]
        let result = try FluxiaLedger.totals(entries: entries, ownerID: owner, month: month)
        XCTAssertEqual(result.available, 1670)
        XCTAssertEqual(result.actualSpending, 700)
    }

    func testBelowPlanContributionDoesNotIncreaseAvailable() throws {
        let entries = [entry(.income, 1000), entry(.plannedProvision, 100),
                       entry(.provisionContribution, 40)]
        XCTAssertEqual(try FluxiaLedger.totals(entries: entries, ownerID: owner, month: month).available, 900)
    }

    func testLinkedFixedBankChargeNotDoubleCounted() throws {
        let fixedID = UUID()
        let entries = [entry(.income, 1000), entry(.fixedExpense, 80, id: fixedID),
                       entry(.variableExpense, 80, fixedID: fixedID)]
        let result = try FluxiaLedger.totals(entries: entries, ownerID: owner, month: month)
        XCTAssertEqual(result.fixedPaid, 80)
        XCTAssertEqual(result.variables, 0)
        XCTAssertEqual(result.available, 920)
    }

    func testArchivedAndOtherUserEntriesExcluded() throws {
        let entries = [entry(.income, 1000), entry(.variableExpense, 400, status: .archived),
                       entry(.variableExpense, 700, ownerID: other)]
        XCTAssertEqual(try FluxiaLedger.totals(entries: entries, ownerID: owner, month: month).available, 1000)
    }

    func testDuplicateIdentifierRejected() {
        let id = UUID()
        let entries = [entry(.income, 10, id: id), entry(.income, 10, id: id)]
        XCTAssertThrowsError(try FluxiaLedger.totals(entries: entries, ownerID: owner, month: month))
    }
}
