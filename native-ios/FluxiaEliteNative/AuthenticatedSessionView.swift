import SwiftUI

struct AuthenticatedSessionView: View {
    @ObservedObject var session: AuthSessionModel
    @State private var profiles: [FluxiaCloudFinanceRepository.Profile] = []
    @State private var selectedProfileID: String? = nil
    @State private var sections: [FluxiaCloudFinanceRepository.Section] = []
    @State private var isLoading = false
    @State private var message: String?
    @ScaledMetric(relativeTo: .largeTitle) private var amountFontSize: CGFloat = 22

    private var ownerID: String? {
        guard case .authenticated(let id) = session.state else { return nil }
        return id
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Tus finanzas").font(.title2.bold())
                Label("Sesión segura activa", systemImage: "checkmark.shield.fill")
                    .foregroundStyle(ElitePalette.blue)
                Text("Solo lectura · perfil autenticado · sin escrituras")
                    .font(.footnote).foregroundStyle(ElitePalette.ink.opacity(0.72))

                if profiles.count > 1 {
                    Picker("Perfil de Fluxia", selection: $selectedProfileID) {
                        Text("Elige un perfil").tag(nil as String?)
                        ForEach(profiles) { profile in Text(profile.title).tag(profile.id as String?) }
                    }
                    .pickerStyle(.menu)
                    .onChange(of: selectedProfileID) { _, profileID in
                        guard let profileID else { sections = []; return }
                        Task { await loadProfile(profileID) }
                    }
                }

                if isLoading {
                    ProgressView("Cargando datos de tu perfil…").frame(maxWidth: .infinity, alignment: .leading)
                } else if let message {
                    Label(message, systemImage: "info.circle")
                        .font(.subheadline).foregroundStyle(ElitePalette.ink.opacity(0.8))
                }

                ForEach(sections) { section in
                    VStack(alignment: .leading, spacing: 11) {
                        HStack {
                            Text(section.title).font(.headline)
                            Spacer()
                            Text("\(section.items.count)").font(.caption.weight(.semibold)).foregroundStyle(ElitePalette.blue)
                        }
                        if let warning = section.warning {
                            Text(warning).font(.footnote).foregroundStyle(.orange)
                        } else if section.items.isEmpty {
                            Text("Sin registros en este bloque.").font(.footnote).foregroundStyle(.secondary)
                        } else {
                            ForEach(section.items) { item in
                                HStack(alignment: .firstTextBaseline) {
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(item.title).font(.subheadline)
                                        if !item.detail.isEmpty {
                                            Text(item.detail).font(.caption).foregroundStyle(ElitePalette.ink.opacity(0.65))
                                        }
                                    }
                                    Spacer(minLength: 10)
                                    if let amount = item.amountCents {
                                        Text(euros(amount)).font(.system(size: amountFontSize, weight: .semibold))
                                            .monospacedDigit().lineLimit(1).minimumScaleFactor(0.75)
                                    }
                                }
                                .padding(.vertical, 5)
                                if item.id != section.items.last?.id { Divider() }
                            }
                        }
                    }
                    .padding(16)
                    .background(ElitePalette.card, in: RoundedRectangle(cornerRadius: 17))
                }

                if !sections.isEmpty {
                    Text("Importes mostrados registro por registro. El Disponible no se calcula aquí hasta validar completamente el formato de cada perfil.")
                        .font(.footnote).foregroundStyle(ElitePalette.ink.opacity(0.68))
                }

                Button("Actualizar lectura") { Task { await refreshProfiles() } }
                    .buttonStyle(.bordered)
                    .tint(ElitePalette.blue)
                    .disabled(isLoading)
                Button("Cerrar sesión") { Task { await session.signOut() } }
                    .buttonStyle(.borderedProminent)
                    .tint(ElitePalette.blue)
                    .disabled(session.isBusy)
                if let authMessage = session.message {
                    Text(authMessage).font(.footnote).foregroundStyle(.red)
                }
            }
            .padding(22)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ElitePalette.navy.ignoresSafeArea())
        .foregroundStyle(ElitePalette.ink)
        .accessibilityIdentifier("authenticated-finance-read-only")
        .task(id: ownerID) { await refreshProfiles() }
    }

    private func refreshProfiles() async {
        guard ownerID != nil else { sections = []; profiles = []; return }
        isLoading = true
        message = nil
        sections = []
        defer { isLoading = false }
        do {
            let requestedOwner = ownerID
            let foundProfiles = try await session.financeProfiles()
            guard ownerID == requestedOwner else { return }
            profiles = foundProfiles
            guard !profiles.isEmpty else {
                message = "No se encontraron perfiles financieros vinculados a esta cuenta. No se ha modificado ningún dato."
                return
            }
            if profiles.count == 1 {
                selectedProfileID = profiles[0].id
                await loadProfile(profiles[0].id)
            } else {
                selectedProfileID = nil
                message = "Esta cuenta tiene varios perfiles. Elige cuál quieres consultar."
            }
        } catch {
            message = "No se pudieron cargar los datos de esta cuenta. La nube no se ha modificado."
        }
    }

    private func loadProfile(_ profileID: String) async {
        guard let requestedOwner = ownerID else { sections = []; return }
        isLoading = true
        message = nil
        sections = []
        defer { isLoading = false }
        do {
            let loadedSections = try await session.financePreview(profileID: profileID)
            guard ownerID == requestedOwner, selectedProfileID == profileID else { return }
            sections = loadedSections
        } catch {
            message = "No se pudo leer este perfil. La nube no se ha modificado."
        }
    }

    private func euros(_ cents: Int64) -> String {
        (Decimal(cents) / Decimal(100)).formatted(.currency(code: "EUR").locale(Locale(identifier: "es_ES")))
    }
}
