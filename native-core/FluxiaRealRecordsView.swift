#if canImport(SwiftUI)
import SwiftUI
import Foundation

/// Read-only native browser of canonical Fluxia finance collections.
/// A source amount is NOT a paid amount or an accounting total.
@MainActor
struct FluxiaRealRecordsView: View {
    let records: [FluxiaCloudReader.Record]
    let initialKey: String
    let showModulePicker: Bool

    init(records: [FluxiaCloudReader.Record], initialKey: String = "planRescate_v2_movimientos", showModulePicker: Bool = true) {
        self.records = records
        self.initialKey = initialKey
        self.showModulePicker = showModulePicker
        self._selectedKey = State(initialValue: initialKey)
    }

    private struct Module: Identifiable {
        let title: String
        let key: String
        var id: String { key }
    }
    private let modules: [Module] = [
        .init(title: "Variables", key: "planRescate_v2_movimientos"),
        .init(title: "Ingresos", key: "planRescate_v2_ingresos"),
        .init(title: "Fijos", key: "planRescate_v2_fijos"),
        .init(title: "Huchas", key: "planRescate_v2_provisiones"),
        .init(title: "Financiaciones", key: "planRescate_v2_financiaciones"),
        .init(title: "Compartidos", key: "planRescate_v2_compartidos")
    ]

    private struct Item: Identifiable {
        let id: Int
        let title: String
        let amount: String?
        let period: String?
        let category: String?
        let state: String?
        let source: String?
        let identifier: String?
        let extras: [String]
    }
    @State private var selectedKey = "planRescate_v2_movimientos"
    @State private var searchTerm = ""
    @State private var periodFilter = "Todos"
    @State private var showAll = false
    @State private var selectedItem: Item?

    private func str(_ source: [String: Any], keys: [String]) -> String? {
        for k in keys {
            if let value = source[k] as? String, !value.isEmpty { return value }
        }
        return nil
    }
    private func money(_ number: NSNumber?) -> String? {
        guard let number else { return nil }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "es_ES")
        return formatter.string(from: number)
    }
    private var parsed: [Item]? {
        guard modules.contains(where: { $0.key == selectedKey }),
              let raw = records.first(where: { $0.clave == selectedKey })?.v,
              let data = raw.data(using: .utf8),
              let objects = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]]
        else { return nil }
        return objects.enumerated().map { index, obj in
            let name = str(obj, keys: ["concepto", "nombre", "descripcion"]) ?? "Registro sin concepto"
            let amount = money((obj["importe"] as? NSNumber) ?? (obj["importeMensual"] as? NSNumber) ?? (obj["cuota"] as? NSNumber) ?? (obj["importe_total"] as? NSNumber))
            let period = str(obj, keys: ["mes", "fecha", "inicio"])
            let category = str(obj, keys: ["categoria", "tipo"])
            let state = str(obj, keys: ["estado", "status"])
            let origin = str(obj, keys: ["origen"])
            let identifier = str(obj, keys: ["id", "movimientoId"])
            var extra: [String] = []
            if let initial = money(obj["importeInicial"] as? NSNumber) { extra.append("Importe inicial: " + initial) }
            if let payer = str(obj, keys: ["pagado_por", "persona"]) { extra.append("Persona: " + payer) }
            if let end = str(obj, keys: ["fin"]) { extra.append("Fin: " + end) }
            return Item(id: index, title: name, amount: amount, period: period, category: category, state: state, source: origin, identifier: identifier, extras: extra)
        }
    }
    private var periods: [String] {
        ["Todos"] + Array(Set((parsed ?? []).compactMap(\.period))).sorted()
    }
    private var visibleRows: [Item] {
        (parsed ?? []).filter { row in
            (periodFilter == "Todos" || row.period == periodFilter)
            && (searchTerm.isEmpty || [row.title, row.period ?? "", row.category ?? "", row.state ?? ""]
                .contains(where: { $0.localizedCaseInsensitiveContains(searchTerm) }))
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label("Datos reales", systemImage: "checkmark.shield")
                    .font(.headline)
                Spacer()
                Text("SOLO LECTURA")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.secondary)
            }
            if showModulePicker {
                Picker("Módulo", selection: $selectedKey) {
                    ForEach(modules) { module in Text(module.title).tag(module.key) }
                }
                .pickerStyle(.menu)
            }
            TextField("Buscar concepto, categoría o estado", text: $searchTerm)
                .textInputAutocapitalization(.never)
                .textFieldStyle(.roundedBorder)
            HStack(spacing: 8) {
                Text("Periodo").font(.caption).foregroundStyle(.secondary)
                Picker("Periodo", selection: $periodFilter) {
                    ForEach(periods, id: \.self) { value in Text(value).tag(value) }
                }
                .pickerStyle(.menu)
                Spacer()
            }
            if let parsed {
                HStack {
                    Text("\(visibleRows.count) de \(parsed.count) registros")
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    Button(showAll ? "Ver menos" : "Ver más") { showAll.toggle() }
                        .font(.caption)
                }
                if visibleRows.isEmpty {
                    Text("No hay registros que coincidan con estos filtros.")
                        .font(.subheadline).foregroundStyle(.secondary)
                        .padding(.vertical, 18)
                }
                LazyVStack(spacing: 0) {
                    ForEach(Array(visibleRows.prefix(showAll ? 200 : 15))) { item in
                        Button { selectedItem = item } label: {
                            HStack(alignment: .center, spacing: 10) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(item.title).font(.subheadline.weight(.medium))
                                        .lineLimit(2).foregroundStyle(.primary)
                                    HStack(spacing: 6) {
                                        if let period = item.period { Text(period) }
                                        if let category = item.category { Text("· " + category) }
                                    }
                                    .font(.caption).foregroundStyle(.secondary)
                                    .lineLimit(1)
                                    if let state = item.state {
                                        Text(state).font(.caption2).foregroundStyle(.secondary)
                                    }
                                }
                                Spacer(minLength: 4)
                                VStack(alignment: .trailing, spacing: 5) {
                                    if let amount = item.amount {
                                        Text(amount).font(.subheadline.weight(.semibold))
                                            .monospacedDigit().foregroundStyle(.primary)
                                    }
                                    Image(systemName: "chevron.right")
                                        .font(.caption2).foregroundStyle(.tertiary)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.vertical, 10)
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        Divider()
                    }
                }
                if visibleRows.count > 200 {
                    Text("Mostrando hasta 200 registros por rendimiento.")
                        .font(.caption).foregroundStyle(.secondary)
                }
            } else {
                Label("Colección no disponible o formato no reconocido; no implica saldo cero.", systemImage: "exclamationmark.triangle")
                    .font(.subheadline).foregroundStyle(.orange)
            }
            Text("Importes originales, sin sumas ni estados de pago inferidos. Disponible pendiente de conciliación.")
                .font(.caption2).foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 16))
        .onChange(of: initialKey) { _, newValue in
            selectedKey = newValue
            searchTerm = ""
            periodFilter = "Todos"
            showAll = false
        }
        .onChange(of: selectedKey) { _, _ in
            searchTerm = ""
            periodFilter = "Todos"
            showAll = false
        }
        .sheet(item: $selectedItem) { item in
            NavigationStack {
                List {
                    LabeledContent("Concepto", value: item.title)
                    if let amount = item.amount { LabeledContent("Importe de origen", value: amount) }
                    if let period = item.period { LabeledContent("Fecha o periodo", value: period) }
                    if let category = item.category { LabeledContent("Categoría/tipo", value: category) }
                    if let state = item.state { LabeledContent("Estado registrado", value: state) }
                    if let source = item.source { LabeledContent("Origen", value: source) }
                    if let identifier = item.identifier { LabeledContent("Identificador", value: identifier) }
                    ForEach(item.extras, id: \.self) { line in Text(line) }
                }
                .navigationTitle("Detalle real")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .topBarTrailing) {
                    Button("Cerrar") { selectedItem = nil }
                }}
            }
        }
    }
}
#endif
