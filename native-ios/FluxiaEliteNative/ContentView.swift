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
    @State private var showPrivacy = false
    @State private var selectedModule: EliteFinanceModule = .fixed
    private let sampleMonth = FinanceRules.Month(
        incomeCents: 250_000,
        fixedExpenseCents: 70_000,
        variableExpenseCents: 30_000,
        plannedProvisionCents: 10_000,
        actualProvisionContributionCents: 10_000
    )

    private func formattedEuros(_ cents: Int64) -> String {
        (Decimal(cents) / Decimal(100)).formatted(.currency(code: "EUR").locale(Locale(identifier: "es_ES")))
    }

    var body: some View {
        TabView(selection: $selection) {
            ForEach(EliteTab.allCases) { tab in
                NavigationStack {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 22) {
                            header
                            switch tab {
                            case .home: home
                            case .plan: financeModules
                            case .banks: placeholder("Bancos", "Sin conexión bancaria en esta versión de demostración.")
                            case .settings: settingsView
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
                Text(FinanceRules.availableCents(sampleMonth).map(formattedEuros) ?? "Error de cálculo")
                    .font(.system(size: 38, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                Text("Importe ficticio, no conectado a tu cuenta")
                    .font(.caption).foregroundStyle(.white.opacity(0.7))
            }
            .frame(maxWidth: .infinity).padding(.vertical, 32)
            .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 24))
            .overlay(RoundedRectangle(cornerRadius: 24).stroke(ElitePalette.gold.opacity(0.4)))

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                tile("Ingresos", formattedEuros(sampleMonth.incomeCents), "arrow.down.left")
                tile("Gastos fijos", formattedEuros(sampleMonth.fixedExpenseCents), "calendar")
                tile("Huchas", formattedEuros(sampleMonth.plannedProvisionCents), "archivebox")
                tile("Gastos variables", formattedEuros(sampleMonth.variableExpenseCents), "creditcard")
            }
            Text("Versión nativa inicial. Sin autenticación, datos reales ni operaciones bancarias.")
                .font(.footnote).foregroundStyle(.white.opacity(0.65))
        }
    }

    private var financeModules: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Mis finanzas").font(.title2).bold()
            Text("Explora las secciones de la futura aplicación. Todas las cifras son ficticias.")
                .font(.footnote).foregroundStyle(.white.opacity(0.7))
            ForEach(EliteFinanceModule.allCases) { module in
                Button {
                    selectedModule = module
                } label: {
                    HStack(spacing: 14) {
                        Image(systemName: module.symbol)
                            .foregroundStyle(ElitePalette.gold)
                            .frame(width: 28)
                        Text(module.rawValue)
                        Spacer()
                        Image(systemName: selectedModule == module ? "checkmark.circle.fill" : "chevron.right")
                            .foregroundStyle(ElitePalette.gold)
                    }
                    .padding(15)
                    .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 15))
                }
                .buttonStyle(.plain)
            }
            VStack(alignment: .leading, spacing: 9) {
                Text(selectedModule.rawValue).font(.headline)
                Text(selectedModule.explanation)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
                Label("Solo lectura · Demostración", systemImage: "lock.shield")
                    .font(.caption)
                    .foregroundStyle(ElitePalette.gold)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(18)
            .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 18))
        }
    }

    private var settingsView: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Configuración").font(.title2).bold()
            Label("Modo demostración", systemImage: "checkmark.shield.fill")
                .foregroundStyle(ElitePalette.gold)
            Text("Esta versión nativa no tiene sesión iniciada ni acceso a cuentas bancarias.")
                .font(.subheadline).foregroundStyle(.white.opacity(0.8))
            Button {
                showPrivacy.toggle()
            } label: {
                Label(showPrivacy ? "Ocultar información" : "Ver protección de datos", systemImage: "lock.shield")
                    .font(.headline)
            }
            .buttonStyle(.bordered)
            .tint(ElitePalette.gold)
            if showPrivacy {
                VStack(alignment: .leading, spacing: 9) {
                    Label("Sin credenciales almacenadas", systemImage: "checkmark.circle")
                    Label("Sin conexiones bancarias", systemImage: "checkmark.circle")
                    Label("Sin escrituras en la nube", systemImage: "checkmark.circle")
                    Label("Datos de pantalla ficticios", systemImage: "checkmark.circle")
                }
                .font(.footnote)
                .foregroundStyle(.white.opacity(0.85))
                .accessibilityElement(children: .contain)
            }
            Text("Fluxia Élite · SwiftUI LAB 0.1")
                .font(.caption).foregroundStyle(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(22)
        .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 20))
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

private enum EliteFinanceModule: String, CaseIterable, Identifiable {
    case income = "Ingresos"
    case fixed = "Gastos fijos"
    case variable = "Gastos variables"
    case savings = "Huchas"
    case shared = "Compartidos"
    case financing = "Financiaciones"

    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .income: "arrow.down.left.circle"
        case .fixed: "calendar"
        case .variable: "creditcard"
        case .savings: "archivebox"
        case .shared: "person.2"
        case .financing: "chart.bar.xaxis"
        }
    }

    var explanation: String {
        switch self {
        case .income: "Registro de ingresos con persistencia y trazabilidad, pendiente de conexión segura."
        case .fixed: "Control de vencimientos, pagos y conciliación sin duplicar cargos variables."
        case .variable: "Movimientos individuales y resumen mensual, sin confundir el total con Disponible."
        case .savings: "Aportaciones, provisiones, usos y rescates con fechas históricas correctas."
        case .shared: "Gastos compartidos, deudas y liquidaciones independientes por usuario."
        case .financing: "Cuotas, calendario de pagos y saldo pendiente sin resurrecciones."
        }
    }
}
