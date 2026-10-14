#if canImport(SwiftUI)
import SwiftUI
import Foundation

/// Real SwiftUI shell. Uses FluxiaLedger for all displayed financial totals.
/// It deliberately contains no fabricated bank or customer records.
@MainActor
public struct FluxiaEliteAppView: View {
    public enum Section: String, CaseIterable, Identifiable {
        case overview = "Resumen", income = "Ingresos", fixed = "Fijos", variables = "Variables", provisions = "Huchas", banks = "Bancos"
        public var id: String { rawValue }
        var icon: String {
            switch self {
            case .overview: "house"
            case .income: "arrow.down.left"
            case .fixed: "receipt"
            case .variables: "creditcard"
            case .provisions: "archivebox"
            case .banks: "building.columns"
            }
        }
    }

    private let ownerID: UUID?
    private let entries: [FluxiaLedger.Entry]
    @State private var section: Section = .overview
    @State private var monthOffset: Int = 0

    public init(ownerID: UUID? = nil, entries: [FluxiaLedger.Entry] = []) {
        self.ownerID = ownerID
        self.entries = entries
    }

    private var month: String {
        let date = Calendar.current.date(byAdding: .month, value: monthOffset, to: Date()) ?? Date()
        let components = Calendar.current.dateComponents([.year, .month], from: date)
        return String(format: "%04d-%02d", components.year ?? 2026, components.month ?? 1)
    }

    private var totals: Result<FluxiaLedger.Totals, Error>? {
        guard let ownerID, !entries.isEmpty else { return nil }
        return Result { try FluxiaLedger.totals(entries: entries, ownerID: ownerID, month: month) }
    }

    private func euro(_ amount: Decimal) -> String {
        (amount as NSDecimalNumber).formatted(.currency(code: "EUR").locale(Locale(identifier: "es_ES")))
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                HStack {
                    AsyncImage(url: URL(string: "https://nacram1987-cmd.github.io/Fluxia-v20/fluxia-icon.png")) { phase in
                        if let image = phase.image {
                            image.resizable().scaledToFit()
                        } else {
                            Image(systemName: "shield.lefthalf.filled")
                                .resizable().scaledToFit().foregroundStyle(.secondary)
                        }
                    }
                    .frame(width: 32, height: 32)
                    .accessibilityLabel("Identidad oficial de Fluxia")
                    Text("fluxia").font(.system(size: 27, weight: .semibold, design: .serif))
                    Text("ÉLITE BETA").font(.system(size: 9, weight: .bold)).foregroundStyle(.brown)
                    Spacer()
                    Image(systemName: "bell").accessibilityLabel("Notificaciones")
                }
                .padding()
                HStack {
                    Button { monthOffset -= 1 } label: { Image(systemName: "chevron.left") }
                    Spacer()
                    Text(month).font(.headline)
                    Spacer()
                    Button { monthOffset += 1 } label: { Image(systemName: "chevron.right") }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 12)

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        if ownerID == nil {
                            Label("Inicia sesión para consultar tus datos reales", systemImage: "lock.shield")
                                .font(.subheadline).foregroundStyle(.secondary)
                                .padding()
                        } else if let totals, case .failure(let error) = totals {
                            Label("Error de integridad: \(error.localizedDescription)", systemImage: "exclamationmark.triangle")
                                .foregroundStyle(.red)
                                .padding()
                        }
                        switch section {
                        case .overview:
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Disponible").font(.subheadline).opacity(0.85)
                                Text(availableText).font(.system(size: 37, weight: .semibold, design: .serif))
                                Text(entries.isEmpty ? "Pendiente de importar y validar los movimientos reales" : "Calculado por FluxiaLedger · sin datos de prueba")
                                    .font(.caption).opacity(0.75)
                            }
                            .foregroundStyle(.white)
                            .padding(24)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(red: 0.09, green: 0.21, blue: 0.34), in: RoundedRectangle(cornerRadius: 20))
                            LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
                                summary("Ingresos", value: value(\.income))
                                summary("Fijos pagados", value: value(\.fixedPaid))
                                summary("Variables", value: value(\.variables))
                                summary("Provisiones", value: value(\.plannedProvisions))
                            }
                        case .income: detail("Ingresos", value: value(\.income))
                        case .fixed: detail("Fijos pagados", value: value(\.fixedPaid))
                        case .variables: detail("Variables", value: value(\.variables))
                        case .provisions: detail("Provisiones previstas", value: value(\.plannedProvisions))
                        case .banks:
                            Label("La conexión bancaria nativa aún no está implementada", systemImage: "building.columns")
                                .padding()
                        }
                    }
                    .padding()
                }
                HStack {
                    ForEach(Section.allCases) { item in
                        Button {
                            section = item
                        } label: {
                            VStack(spacing: 4) {
                                Image(systemName: item.icon)
                                Text(item.rawValue).font(.system(size: 9))
                            }
                            .frame(maxWidth: .infinity)
                            .foregroundStyle(section == item ? Color(red: 0.09, green: 0.21, blue: 0.34) : .gray)
                        }
                    }
                }
                .padding(.vertical, 12)
                .background(.white)
            }
            .background(Color(red: 0.97, green: 0.97, blue: 0.95))
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private var availableText: String {
        guard case .success(let totals) = totals else { return "—" }
        return euro(totals.available)
    }

    private func value(_ keyPath: KeyPath<FluxiaLedger.Totals, Decimal>) -> String {
        guard case .success(let totals) = totals else { return "—" }
        return euro(totals[keyPath: keyPath])
    }

    private func summary(_ label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            Text(value).font(.system(size: 20, weight: .semibold, design: .serif))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(15)
        .background(.white, in: RoundedRectangle(cornerRadius: 16))
    }

    private func detail(_ label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(label).font(.subheadline).foregroundStyle(.secondary)
            Text(value).font(.system(size: 32, weight: .semibold, design: .serif))
            Text("Solo datos de la cuenta autenticada y el mes seleccionado")
                .font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.white, in: RoundedRectangle(cornerRadius: 18))
    }
}
#endif
