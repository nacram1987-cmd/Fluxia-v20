import Combine
import Foundation

/// Editable synthetic ledger used only by the explicitly entered demo.
/// It is stored separately from every authenticated user's data.
@MainActor
final class DemoLedgerModel: ObservableObject {
    private static let ownerID = "fluxia-synthetic-preview-owner"
    @Published private(set) var entries: [EncryptedLedgerStore.Entry] = []
    @Published private(set) var storageMessage: String?

    private let store: EncryptedLedgerStore

    init() {
        let directory = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("FluxiaSyntheticPreview", isDirectory: true)
        store = EncryptedLedgerStore(directoryURL: directory)
        do {
            entries = try store.entries(ownerID: Self.ownerID, authenticatedOwnerID: Self.ownerID)
            if entries.isEmpty { try seedSyntheticData() }
        } catch {
            storageMessage = "No se pudo abrir la demo local cifrada."
        }
    }

    func month(_ date: Date) -> FinanceRules.Month {
        let components = Calendar.current.dateComponents([.year, .month], from: date)
        guard let year = components.year, let number = components.month,
              let period = MonthlyLedgerProjection.Period(year: year, month: number) else {
            return .init(incomeCents: 0, fixedExpenseCents: 0, variableExpenseCents: 0,
                         plannedProvisionCents: 0, actualProvisionContributionCents: 0)
        }
        let projectedEntries = entries.compactMap { entry -> MonthlyLedgerProjection.Entry? in
            guard let entryPeriod = MonthlyLedgerProjection.Period(year: entry.year, month: entry.month) else { return nil }
            return MonthlyLedgerProjection.Entry(
                id: entry.id, ownerID: entry.ownerID, period: entryPeriod,
                kind: Self.projectionKind(entry.kind), amountCents: entry.amountCents, posting: .included
            )
        }
        return MonthlyLedgerProjection.project(entries: projectedEntries,
                                               authenticatedOwnerID: Self.ownerID, period: period)
            ?? .init(incomeCents: 0, fixedExpenseCents: 0, variableExpenseCents: 0,
                     plannedProvisionCents: 0, actualProvisionContributionCents: 0)
    }

    func entries(in date: Date) -> [EncryptedLedgerStore.Entry] {
        let components = Calendar.current.dateComponents([.year, .month], from: date)
        return entries.filter { $0.year == components.year && $0.month == components.month }
            .sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
    }

    @discardableResult
    func add(title: String, amountCents: Int64, kind: EncryptedLedgerStore.Entry.Kind, date: Date) -> Bool {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let components = Calendar.current.dateComponents([.year, .month], from: date)
        guard !cleanTitle.isEmpty, amountCents > 0,
              let year = components.year, let month = components.month else { return false }
        let operationID = UUID().uuidString
        let entry = EncryptedLedgerStore.Entry(id: UUID().uuidString, ownerID: Self.ownerID,
                                               year: year, month: month, kind: kind,
                                               amountCents: amountCents, operationID: operationID)
        do {
            guard case .inserted = try store.append(entry, authenticatedOwnerID: Self.ownerID) else {
                storageMessage = "No se pudo añadir el movimiento de prueba."
                return false
            }
            entries = try store.entries(ownerID: Self.ownerID, authenticatedOwnerID: Self.ownerID)
            storageMessage = nil
            return true
        } catch {
            storageMessage = "No se pudo guardar la demo cifrada."
            return false
        }
    }

    private func seedSyntheticData() throws {
        let now = Calendar.current.dateComponents([.year, .month], from: Date())
        guard let year = now.year, let month = now.month else { return }
        let seed: [(String, Int64, EncryptedLedgerStore.Entry.Kind)] = [
            ("Nómina · demo", 250_000, .income),
            ("Vivienda · demo", 70_000, .fixedExpense),
            ("Compra · demo", 30_000, .variableExpense),
            ("Provisión · prevista", 10_000, .plannedProvision),
            ("Aportación · demo", 10_000, .provisionContribution)
        ]
        for (index, item) in seed.enumerated() {
            let entry = EncryptedLedgerStore.Entry(id: "preview-\(index)", ownerID: Self.ownerID, title: item.0,
                                                   year: year, month: month, kind: item.2,
                                                   amountCents: item.1, operationID: "preview-seed-\(index)")
            _ = try store.append(entry, authenticatedOwnerID: Self.ownerID)
        }
        entries = try store.entries(ownerID: Self.ownerID, authenticatedOwnerID: Self.ownerID)
    }

    private static func projectionKind(_ kind: EncryptedLedgerStore.Entry.Kind) -> MonthlyLedgerProjection.Kind {
        switch kind {
        case .income: .income
        case .fixedExpense: .fixedExpense
        case .variableExpense: .variableExpense
        case .plannedProvision: .plannedProvision
        case .provisionContribution: .provisionContribution
        }
    }
}
