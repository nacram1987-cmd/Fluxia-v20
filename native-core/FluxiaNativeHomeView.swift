#if canImport(SwiftUI)
import SwiftUI
import Foundation

/// Real authenticated navigation over existing cloud collections.
/// Financial projections are intentionally withheld until reconciled.
@MainActor
struct FluxiaNativeHomeView: View {
    let records: [FluxiaCloudReader.Record]
    let signOut: () -> Void
    private let navy = Color(red: 0.08, green: 0.20, blue: 0.32)
    private let gold = Color(red: 0.71, green: 0.51, blue: 0.22)

    enum Page: String, CaseIterable, Identifiable {
        case home = "Inicio", income = "Ingresos", fixed = "Fijos", variable = "Variables", provisions = "Huchas", shared = "Compartidos", financing = "Financiaciones", banks = "Bancos"
        var id: String { rawValue }
        var icon: String {
            switch self {
            case .home: "house.fill"
            case .income: "arrow.down.left.circle"
            case .fixed: "receipt"
            case .variable: "creditcard"
            case .provisions: "archivebox"
            case .shared: "person.2"
            case .financing: "calendar.badge.clock"
            case .banks: "building.columns"
            }
        }
        var key: String? {
            switch self {
            case .income: "planRescate_v2_ingresos"
            case .fixed: "planRescate_v2_fijos"
            case .variable: "planRescate_v2_movimientos"
            case .provisions: "planRescate_v2_provisiones"
            case .shared: "planRescate_v2_compartidos"
            case .financing: "planRescate_v2_financiaciones"
            default: nil
            }
        }
    }

    @State private var page: Page = .home
    @State private var showMenu = false
    private let primaryTabs: [Page] = [.home, .income, .fixed, .variable, .provisions]

    private func count(_ key: String) -> Int? {
        guard let raw = records.first(where: { $0.clave == key })?.v,
              let data = raw.data(using: .utf8),
              let array = try? JSONSerialization.jsonObject(with: data) as? [Any] else { return nil }
        return array.count
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 9) {
                Button { showMenu = true } label: { Image(systemName: "line.3.horizontal").font(.title3) }
                    .accessibilityLabel("Abrir menú")
                Image(systemName: "waveform.path").foregroundStyle(gold)
                Text("fluxia").font(.system(size: 23, weight: .semibold, design: .serif))
                Text("ÉLITE BETA").font(.system(size: 9, weight: .bold)).foregroundStyle(gold)
                Spacer()
                Button("Salir") { signOut() }.font(.caption)
            }
            .padding(.horizontal, 15)
            .padding(.vertical, 11)
            .foregroundStyle(navy)
            .background(.white)

            ScrollView {
                VStack(alignment: .leading, spacing: 13) {
                    Text(page.rawValue)
                        .font(.title2.bold())
                        .foregroundStyle(navy)
                    if page == .home {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Disponible").font(.subheadline)
                            Text("—").font(.system(size: 36, weight: .semibold, design: .serif))
                            Text("Pendiente de conciliación. No se muestran saldos inventados.")
                                .font(.caption)
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(20)
                        .background(navy, in: RoundedRectangle(cornerRadius: 18))
                        LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 10) {
                            ForEach([Page.income, .fixed, .variable, .provisions, .shared, .financing]) { item in
                                Button { page = item } label: {
                                    VStack(alignment: .leading, spacing: 7) {
                                        Image(systemName: item.icon).foregroundStyle(gold)
                                        Text(item.rawValue).font(.subheadline.bold())
                                        Text(item.key.flatMap(count).map { "\($0) registros" } ?? "Sin datos validados")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(14)
                                    .background(.white, in: RoundedRectangle(cornerRadius: 15))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        Text("Registros originales de tu cuenta. Consulta de solo lectura.")
                            .font(.caption).foregroundStyle(.secondary)
                    } else if let key = page.key {
                        FluxiaRealRecordsView(records: records, initialKey: key, showModulePicker: false)
                    } else {
                        Label("La conexión bancaria nativa aún no está implementada. No se consulta ni modifica ningún banco.", systemImage: "building.columns")
                            .font(.subheadline)
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(.white, in: RoundedRectangle(cornerRadius: 16))
                    }
                }
                .padding(13)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(Color(red: 0.97, green: 0.97, blue: 0.95))
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            HStack(spacing: 0) {
                ForEach(primaryTabs) { item in
                    Button { page = item } label: {
                        VStack(spacing: 4) {
                            Image(systemName: item.icon).font(.system(size: 19))
                            Text(item.rawValue).font(.system(size: 10)).lineLimit(1)
                        }
                        .frame(maxWidth: .infinity, minHeight: 49)
                        .foregroundStyle(page == item ? navy : .gray)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 5)
            .padding(.top, 6)
            .background(.white)
        }
        .confirmationDialog("Secciones de Fluxia Élite BETA", isPresented: $showMenu, titleVisibility: .visible) {
            ForEach(Page.allCases) { item in
                Button(item.rawValue) { page = item }
            }
            Button("Cancelar", role: .cancel) {}
        }
    }
}
#endif