import SwiftUI

struct ContentView: View {
    @AppStorage("fluxia.elite.darkMode") private var darkMode = false
    @State private var selection: EliteTab = .home
    @State private var month = Date()
    @State private var showPrivacy = false
    @ScaledMetric(relativeTo: .title2) private var brandFontSize: CGFloat = 26
    @ScaledMetric(relativeTo: .largeTitle) private var availableFontSize: CGFloat = 38
    @State private var selectedModule: EliteFinanceModule = .fixed
    private let snapshot = DemoFinanceSnapshot.preview
    private var sampleMonth: FinanceRules.Month { snapshot.month }

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
                            case .banks: bankDemo
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
        .foregroundStyle(ElitePalette.ink)
        .preferredColorScheme(darkMode ? .dark : .light)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Text("FLUXIA").font(.system(size: brandFontSize, weight: .bold, design: .rounded))
                    .tracking(3)
                Text("ÉLITE").font(.system(size: 12, weight: .bold))
                    .foregroundStyle(LinearGradient(colors: [Color(red: 0.73, green: 0.53, blue: 0.27), Color(red: 0.98, green: 0.86, blue: 0.60), Color(red: 0.69, green: 0.47, blue: 0.23)], startPoint: .leading, endPoint: .trailing))
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
                .accessibilityLabel("Mes anterior")
                Spacer()
                Text(month.formatted(.dateTime.month(.wide).year().locale(Locale(identifier: "es_ES"))))
                    .font(.headline)
                    .accessibilityLabel("Mes seleccionado: \(month.formatted(.dateTime.month(.wide).year().locale(Locale(identifier: "es_ES"))))")
                Spacer()
                Button { month = Calendar.current.date(byAdding: .month, value: 1, to: month) ?? month } label: {
                    Image(systemName: "chevron.right")
                }
                .accessibilityLabel("Mes siguiente")
            }
            .foregroundStyle(ElitePalette.ink)
            .accessibilityElement(children: .contain)

            VStack(spacing: 10) {
                Text("DISPONIBLE · DEMOSTRACIÓN")
                    .font(.caption).tracking(1.2)
                Text(FinanceRules.availableCents(sampleMonth).map(formattedEuros) ?? "Error de cálculo")
                    .font(.system(size: availableFontSize, weight: .semibold, design: .rounded))
                    .accessibilityLabel("Disponible ficticio: \(FinanceRules.availableCents(sampleMonth).map(formattedEuros) ?? "Error de cálculo")")
                    .monospacedDigit()
                Text("Saldo ficticio · Sin conexión bancaria")
                    .font(.caption).foregroundStyle(ElitePalette.ink.opacity(0.7))
            }
            .frame(maxWidth: .infinity).padding(.vertical, 32)
            .background(LinearGradient(colors: [ElitePalette.card, ElitePalette.availableEnd], startPoint: .topLeading, endPoint: .bottomTrailing), in: RoundedRectangle(cornerRadius: 24))
            .overlay(RoundedRectangle(cornerRadius: 24).stroke(ElitePalette.champagne.opacity(0.85), lineWidth: 1))
            .shadow(color: ElitePalette.champagne.opacity(0.20), radius: 14, y: 6)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                tile("Ingresos", formattedEuros(sampleMonth.incomeCents), "arrow.down.left", .income)
                tile("Gastos fijos", formattedEuros(sampleMonth.fixedExpenseCents), "calendar", .fixed)
                tile("Huchas", formattedEuros(sampleMonth.plannedProvisionCents), "archivebox", .savings)
                tile("Gastos variables", formattedEuros(sampleMonth.variableExpenseCents), "creditcard", .variable)
            }
            Text("Vista de ejemplo: cambiar de mes no modifica los importes ficticios.")
                .font(.footnote).foregroundStyle(ElitePalette.ink.opacity(0.65))
        }
    }

    private var financeModules: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Mis finanzas").font(.title2).bold()
            Text("Explora las secciones de la futura aplicación. Todas las cifras son ficticias.")
                .font(.footnote).foregroundStyle(ElitePalette.ink.opacity(0.7))
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
                    .overlay(RoundedRectangle(cornerRadius: 15).stroke(ElitePalette.ink.opacity(0.06), lineWidth: 1))
                }
                .buttonStyle(.plain)
            }
            VStack(alignment: .leading, spacing: 9) {
                Text(selectedModule.rawValue).font(.headline)
                Text(selectedModule.explanation)
                    .font(.subheadline)
                    .foregroundStyle(ElitePalette.ink.opacity(0.8))
                Label("Solo lectura · Demostración", systemImage: "lock.shield")
                    .font(.caption)
                    .foregroundStyle(ElitePalette.gold)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(18)
            .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 18))
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(ElitePalette.ink.opacity(0.06), lineWidth: 1))
        }
    }

    private var bankDemo: some View {
        let bill = ExpenseReconciliation.FixedBill(
            id: "demo-endesa", description: "Endesa", expectedCents: 6_200, alreadyPaid: false
        )
        let charge = ExpenseReconciliation.Charge(
            id: "demo-charge", description: "ENDESA", cents: 6_200
        )
        let match = ExpenseReconciliation.suggestMatch(charge: charge, bills: [bill])
        return VStack(alignment: .leading, spacing: 16) {
            Text("Bancos").font(.title2).bold()
            Label("Sin bancos conectados", systemImage: "lock.shield")
                .foregroundStyle(ElitePalette.gold)
            Text("Así se mostrará la conciliación de un movimiento ficticio.")
                .font(.subheadline).foregroundStyle(ElitePalette.ink.opacity(0.7))
            HStack {
                Image(systemName: "bolt.fill").foregroundStyle(ElitePalette.gold)
                VStack(alignment: .leading) {
                    Text("ENDESA").font(.headline)
                    Text("Cargo ficticio").font(.caption).foregroundStyle(ElitePalette.ink.opacity(0.6))
                }
                Spacer()
                Text(formattedEuros(charge.cents)).font(.headline).monospacedDigit()
            }
            .padding(16)
            .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 18))
            switch match {
            case .unique:
                Label("Coincide con gasto fijo pendiente · requiere confirmación", systemImage: "checkmark.circle")
                    .foregroundStyle(ElitePalette.gold)
            case .ambiguous:
                Label("Coincidencia ambigua · requiere revisión", systemImage: "exclamationmark.triangle")
                    .foregroundStyle(.orange)
            case .none:
                Label("Sin coincidencia segura", systemImage: "questionmark.circle")
                    .foregroundStyle(ElitePalette.ink)
            }
            Text("Ningún cargo se marca pagado ni se contabiliza desde esta demostración.")
                .font(.footnote).foregroundStyle(ElitePalette.ink.opacity(0.65))
        }
    }

    private var settingsView: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Configuración").font(.title2).bold()
            Toggle(isOn: $darkMode) {
                Label("Modo oscuro", systemImage: darkMode ? "moon.stars.fill" : "sun.max.fill")
            }
            .tint(ElitePalette.gold)
            Text("El modo claro es el diseño principal de Fluxia Élite.")
                .font(.caption).foregroundStyle(ElitePalette.ink.opacity(0.7))
            Label("Modo demostración", systemImage: "checkmark.shield.fill")
                .foregroundStyle(ElitePalette.gold)
            Text("Esta versión nativa no tiene sesión iniciada ni acceso a cuentas bancarias.")
                .font(.subheadline).foregroundStyle(ElitePalette.ink.opacity(0.8))
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
                .foregroundStyle(ElitePalette.ink.opacity(0.85))
                .accessibilityElement(children: .contain)
            }
            Text("Fluxia Élite · SwiftUI LAB 0.1")
                .font(.caption).foregroundStyle(ElitePalette.ink.opacity(0.6))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(22)
        .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 20))
    }

    private func tile(_ title: String, _ amount: String, _ symbol: String, _ module: EliteFinanceModule) -> some View {
        Button {
            selectedModule = module
            selection = .plan
        } label: {
            VStack(alignment: .leading, spacing: 13) {
                Image(systemName: symbol).foregroundStyle(ElitePalette.gold)
                Text(title).font(.subheadline)
                Text(amount).font(.headline).monospacedDigit()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 18))
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(ElitePalette.champagne.opacity(0.32), lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(title), \(amount). Abrir sección")
    }

    private func placeholder(_ title: String, _ message: String) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title).font(.title2).bold()
            Text(message).foregroundStyle(ElitePalette.ink.opacity(0.7))
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
