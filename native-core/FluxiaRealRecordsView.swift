#if canImport(SwiftUI)
import SwiftUI
import Foundation

/// Authenticated, strictly read-only inspection of canonical Fluxia HTML records.
/// Do not use this inventory as a financial ledger or to compute Disponible.
@MainActor
struct FluxiaRealRecordsView: View {
    let records: [FluxiaCloudReader.Record]

    private struct Module: Identifiable {
        let title: String
        let canonicalKey: String
        let symbol: String
        var id: String { canonicalKey }
    }

    private let modules: [Module] = [
        .init(title: "Movimientos", canonicalKey: "planRescate_v2_movimientos", symbol: "list.bullet.rectangle"),
        .init(title: "Ingresos", canonicalKey: "planRescate_v2_ingresos", symbol: "arrow.down.left"),
        .init(title: "Gastos fijos", canonicalKey: "planRescate_v2_fijos", symbol: "receipt"),
        .init(title: "Provisiones", canonicalKey: "planRescate_v2_provisiones", symbol: "archivebox"),
        .init(title: "Financiaciones", canonicalKey: "planRescate_v2_financiaciones", symbol: "creditcard"),
        .init(title: "Compartidos", canonicalKey: "planRescate_v2_compartidos", symbol: "person.2")
    ]

    private struct DisplayRow: Identifiable {
        let id: Int
        let title: String
        let amount: String?
        let period: String
    }

    @State private var selectedKey = "planRescate_v2_movimientos"
    @State private var showAll = false
    @State private var searchTerm = ""

    private func items(for key: String) -> [DisplayRow]? {
        // Only read keys identified by the canonical HTML contract.
        guard modules.contains(where: { $0.canonicalKey == key }),
              let record = records.first(where: { $0.clave == key }),
              let raw = record.v,
              let data = raw.data(using: .utf8),
              let decoded = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]]
        else { return nil }

        return decoded.enumerated().map { i, object in
            let name = (object["concepto"] as? String)
                ?? (object["nombre"] as? String)
                ?? "Registro sin concepto"
            let amount = object["importe"] as? NSNumber
            let monthly = object["importeMensual"] as? NSNumber
            let quota = object["cuota"] as? NSNumber
            let displayed = amount ?? monthly ?? quota
            let moneyFormatter = NumberFormatter()
            moneyFormatter.numberStyle = .currency
            moneyFormatter.locale = Locale(identifier: "es_ES")
            let formatted = displayed.flatMap { moneyFormatter.string(from: $0) }
            let month = (object["mes"] as? String)
                ?? (object["fecha"] as? String)
                ?? (object["inicio"] as? String)
                ?? "Sin fecha de periodo"
            return DisplayRow(id: i, title: name, amount: formatted, period: month)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Registros reales de tu nube", systemImage: "checkmark.shield")
                .font(.headline)
            Text("Consulta directa, sin editar, conciliar ni recalcular saldos. La app HTML continúa siendo la fuente de verdad.")
                .font(.caption).foregroundStyle(.secondary)
            Picker("Módulo", selection: $selectedKey) {
                ForEach(modules) { module in
                    Text(module.title).tag(module.canonicalKey)
                }
            }
            .pickerStyle(.menu)
            .onChange(of: selectedKey) { _, _ in showAll = false; searchTerm = "" }
            TextField("Buscar conceptos reales", text: $searchTerm)
                .textInputAutocapitalization(.never)
                .textFieldStyle(.roundedBorder)
            if let allRows = items(for: selectedKey) {
                let rows = allRows.filter { searchTerm.isEmpty || $0.title.localizedCaseInsensitiveContains(searchTerm) || $0.period.localizedCaseInsensitiveContains(searchTerm) }
                HStack {
                    Text(searchTerm.isEmpty ? "\(rows.count) registros reales" : "\(rows.count) de \(allRows.count) registros")
                        .font(.subheadline.bold())
                    Spacer()
                    Button(showAll ? "Ver menos" : "Ver más") { showAll.toggle() }
                        .font(.caption)
                }
                ForEach(Array(rows.prefix(showAll ? 200 : 12))) { item in
                    HStack(alignment: .firstTextBaseline, spacing: 12) {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(item.title).font(.subheadline).lineLimit(2)
                            Text(item.period).font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        if let amount = item.amount {
                            Text(amount).font(.subheadline.monospacedDigit())
                        }
                    }
                    .padding(.vertical, 4)
                    Divider()
                }
                if rows.count > 200 {
                    Text("Vista limitada a 200 registros para mantener la fluidez.")
                        .font(.caption).foregroundStyle(.secondary)
                }
            } else {
                Label("No se ha encontrado esta colección canónica para tu cuenta. No se interpreta como saldo cero.",
                      systemImage: "exclamationmark.triangle")
                    .font(.subheadline).foregroundStyle(.orange)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 18))
    }
}
#endif
