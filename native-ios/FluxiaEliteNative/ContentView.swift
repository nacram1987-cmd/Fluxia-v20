import SwiftUI

private enum ElitePalette {
    static let navy = Color(red: 0.035, green: 0.075, blue: 0.14)
    static let gold = Color(red: 0.83, green: 0.69, blue: 0.42)
    static let card = Color(red: 0.085, green: 0.14, blue: 0.22)
}

private enum EliteTab: String, CaseIterable, Identifiable {
    case home = "Inicio"
    case plan = "Plan"
    case banks = "Bancos"
    case settings = "Ajustes"
    var id: String { rawValue }
    var symbol: String {
        switch self {
        case .home: "house.fill"
        case .plan: "square.grid.2x2.fill"
        case .banks: "building.columns.fill"
        case .settings: "gearshape.fill"
        }
    }
}

struct ContentView: View {
    @State private var selection: EliteTab = .home
    @State private var month = Date()
    private let euro = Locale(identifier: "es_ES")

    var body: some View {
        TabView(selection: $selection) {
            ForEach(EliteTab.allCases) { tab in
                NavigationStack {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 22) {
                            header
                            switch tab {
                            case .home: home
                            case .plan: placeholder("Planificación", "Los módulos financieros se conectarán tras validar la integridad de los datos.")
                            case .banks: placeholder("Bancos", "Sin conexión bancaria en esta versión de demostración.")
                            case .settings: placeholder("Configuración", "Aplicación nativa SwiftUI, independiente de la PWA.")
                            }
                        }
                        .padding(20)
                    }
                    .background(ElitePalette.navy)
                    .toolbar(.hidden, for: .navigationBar)
                }
                .tabItem { Label(tab.rawValue, systemImage: tab.symbol) }
                .tag(tab)
            }
        }
        .tint(ElitePalette.gold)
        .preferredColorScheme(.dark)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Text("FLUXIA").font(.system(size: 26, weight: .bold, design: .rounded))
                    .tracking(3)
                Text("ÉLITE").font(.system(size: 12, weight: .bold))
                    .foregroundStyle(ElitePalette.gold)
                Spacer()
                Image(systemName: "bell")
                    .accessibilityLabel("Notificaciones: demostración")
            }
            Text("iOS NATIVO · LAB · DATOS FICTICIOS")
                .font(.caption2).fontWeight(.semibold)
                .foregroundStyle(ElitePalette.gold)
        }
    }

    private var home: some View {
        VStack(spacing: 20) {
            HStack {
                Button { month = Calendar.current.date(byAdding: .month, value: -1, to: month) ?? month } label: {
                    Image(systemName: "chevron.left")
                }
                Spacer()
                Text(month, format: .dateTime.month(.wide).year())
                    .font(.headline)
                Spacer()
                Button { month = Calendar.current.date(byAdding: .month, value: 1, to: month) ?? month } label: {
                    Image(systemName: "chevron.right")
                }
            }
            .foregroundStyle(.white)
            .accessibilityElement(children: .contain)

            VStack(spacing: 10) {
                Text("DISPONIBLE · DEMOSTRACIÓN")
                    .font(.caption).tracking(1.2)
                Text("1.284,50 €")
                    .font(.system(size: 38, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                Text("Importe ficticio, no conectado a tu cuenta")
                    .font(.caption).foregroundStyle(.white.opacity(0.7))
            }
            .frame(maxWidth: .infinity).padding(.vertical, 32)
            .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 24))
            .overlay(RoundedRectangle(cornerRadius: 24).stroke(ElitePalette.gold.opacity(0.4)))

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                tile("Ingresos", "2.500,00 €", "arrow.down.left")
                tile("Gastos fijos", "950,00 €", "calendar")
                tile("Huchas", "265,50 €", "archivebox")
                tile("Compartidos", "0,00 €", "person.2")
            }
            Text("Versión nativa inicial. Sin autenticación, datos reales ni operaciones bancarias.")
                .font(.footnote).foregroundStyle(.white.opacity(0.65))
        }
    }

    private func tile(_ title: String, _ amount: String, _ symbol: String) -> some View {
        VStack(alignment: .leading, spacing: 13) {
            Image(systemName: symbol).foregroundStyle(ElitePalette.gold)
            Text(title).font(.subheadline)
            Text(amount).font(.headline).monospacedDigit()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 18))
    }

    private func placeholder(_ title: String, _ message: String) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title).font(.title2).bold()
            Text(message).foregroundStyle(.white.opacity(0.7))
            Label("Solo demostración", systemImage: "lock.shield")
                .foregroundStyle(ElitePalette.gold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(22)
        .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 20))
    }
}
