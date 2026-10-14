#if canImport(SwiftUI)
import SwiftUI

/// Authentication gate for the real cloud. Never maps legacy key/value blobs
/// into ledger entries until the canonical migration contract is verified.
@MainActor
public struct FluxiaLoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var message: String?
    @State private var identity: UUID?
    @State private var recordCount: Int?
    @State private var cloudRecords: [FluxiaCloudReader.Record] = []
    @State private var authSession: FluxiaAuthClient.Session?
    @State private var rememberSession = false
    @State private var showNumberPad = false
    @State private var numericTargetPassword = true
    @State private var didAttemptRestore = false

    public init() {}

    private var cloudConfiguration: (URL, String)? {
        guard let raw = Bundle.main.object(forInfoDictionaryKey: "FLUXIA_SUPABASE_URL") as? String,
              let url = URL(string: raw), url.scheme == "https",
              let key = Bundle.main.object(forInfoDictionaryKey: "FLUXIA_SUPABASE_PUBLISHABLE_KEY") as? String,
              !key.isEmpty else { return nil }
        return (url, key)
    }

    public var body: some View {
        Group {
            if let identity {
                TabView {
                    NavigationStack {
                        ScrollView {
                            VStack(alignment: .leading, spacing: 14) {
                                HStack {
                                    Text("Fluxia Élite BETA").font(.title3.bold())
                                    Spacer()
                                    Button("Salir") { signOut() }
                                }
                                Label("Nube real · solo lectura", systemImage: "checkmark.shield")
                                    .font(.caption)
                                if let recordCount {
                                    Text("\(recordCount) colecciones financieras consultadas con tu usuario")
                                        .font(.caption).foregroundStyle(.secondary)
                                }
                                FluxiaRealRecordsView(records: cloudRecords)
                            }
                            .padding()
                        }
                        .background(Color(red: 0.97, green: 0.97, blue: 0.95))
                    }
                    .tabItem { Label("Datos reales", systemImage: "list.bullet.rectangle") }
                    FluxiaEliteAppView(ownerID: identity)
                        .tabItem { Label("Interfaz iOS", systemImage: "iphone") }
                }
            } else {
                VStack(alignment: .leading, spacing: 18) {
                    HStack(spacing: 12) {
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
                        Text("fluxia").font(.system(size: 38, weight: .semibold, design: .serif))
                    }
                    Text("ÉLITE BETA").font(.caption.bold()).foregroundStyle(.brown)
                    Text("Accede con tu cuenta de Fluxia")
                        .font(.title3)
                    TextField("Correo electrónico", text: $email)
                        .textContentType(.username)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .textFieldStyle(.roundedBorder)
                    SecureField("Contraseña", text: $password)
                        .textContentType(.password)
                        .textFieldStyle(.roundedBorder)
                    Toggle("Recordar sesión en este dispositivo", isOn: $rememberSession)
                        .font(.subheadline)
                    Button(showNumberPad ? "Ocultar teclado numérico" : "Mostrar teclado numérico") {
                        showNumberPad.toggle()
                    }
                    .font(.subheadline)
                    .foregroundStyle(Color(red: 0.09, green: 0.21, blue: 0.34))
                    if showNumberPad {
                        Picker("Insertar números en", selection: $numericTargetPassword) {
                            Text("Contraseña").tag(true)
                            Text("Correo").tag(false)
                        }
                        .pickerStyle(.segmented)
                        numericPad
                    }
                    Button {
                        Task { await signIn() }
                    } label: {
                        HStack {
                            if isLoading { ProgressView().tint(.white) }
                            Text("Entrar")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(12)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(isLoading || email.isEmpty || password.isEmpty || cloudConfiguration == nil)
                    if cloudConfiguration == nil {
                        Text("La compilación aún no tiene configurada la conexión pública a Supabase.")
                            .font(.caption).foregroundStyle(.orange)
                    }
                    if let message {
                        Text(message).font(.caption).foregroundStyle(.red)
                    }
                    Text("La contraseña no se almacena. Si activas recordar sesión, solo se guarda el token de renovación en el llavero iOS. En Appetize, el dispositivo virtual puede reiniciarse y perderlo.")
                        .font(.caption).foregroundStyle(.secondary)
                }
                .padding(24)
                .frame(maxWidth: 480)
            }
        }
        .task {
            guard !didAttemptRestore else { return }
            didAttemptRestore = true
            await restoreSession()
        }
    }

    private var numericPad: some View {
        VStack(spacing: 8) {
            ForEach(0..<3, id: \.self) { row in
                HStack(spacing: 8) {
                    ForEach(1..<4, id: \.self) { column in
                        let digit = String(row * 3 + column)
                        Button(digit) { appendDigit(digit) }
                            .frame(maxWidth: .infinity, minHeight: 42)
                            .buttonStyle(.bordered)
                    }
                }
            }
            HStack(spacing: 8) {
                Button("Borrar") {
                    if numericTargetPassword {
                        if !password.isEmpty { password.removeLast() }
                    } else {
                        if !email.isEmpty { email.removeLast() }
                    }
                }
                .frame(maxWidth: .infinity, minHeight: 42)
                .buttonStyle(.bordered)
                Button("0") { appendDigit("0") }
                    .frame(maxWidth: .infinity, minHeight: 42)
                    .buttonStyle(.bordered)
                Button("Listo") { showNumberPad = false }
                    .frame(maxWidth: .infinity, minHeight: 42)
                    .buttonStyle(.borderedProminent)
            }
        }
        .disabled(isLoading)
        .accessibilityElement(children: .contain)
    }

    private func appendDigit(_ digit: String) {
        if numericTargetPassword { password.append(digit) }
        else { email.append(digit) }
    }

    private func restoreSession() async {
        guard let token = FluxiaSecureSession.readRefreshToken(),
              let (url, key) = cloudConfiguration else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            let refreshed = try await FluxiaAuthClient(projectURL: url, publishableKey: key)
                .refresh(token)
            let rows = try await FluxiaCloudReader(projectURL: url, publishableKey: key)
                .fetchCanonicalFinance(ownerID: refreshed.user.id, accessToken: refreshed.access_token)
            guard rows.allSatisfy({ $0.user_id == refreshed.user.id }) else { return }
            rememberSession = true
            _ = FluxiaSecureSession.saveRefreshToken(refreshed.refresh_token)
            cloudRecords = rows
            recordCount = rows.count
            authSession = refreshed
            identity = refreshed.user.id
        } catch {
            // Do not discard a saved session on a transient network failure.
            message = "No se ha podido recuperar la sesión. Accede manualmente."
        }
    }

    private func signIn() async {
        guard let (url, key) = cloudConfiguration else { return }
        isLoading = true
        message = nil
        defer { isLoading = false }
        do {
            let session = try await FluxiaAuthClient(projectURL: url, publishableKey: key)
                .signIn(email: email, password: password)
            password = ""
            let rows = try await FluxiaCloudReader(projectURL: url, publishableKey: key)
                .fetchCanonicalFinance(ownerID: session.user.id, accessToken: session.access_token)
            guard rows.allSatisfy({ $0.user_id == session.user.id }) else {
                message = "Error: se han recibido registros de otro usuario."
                return
            }
            recordCount = rows.count
            cloudRecords = rows
            authSession = session
            identity = session.user.id
            if rememberSession { 
                if !FluxiaSecureSession.saveRefreshToken(session.refresh_token) {
                    message = "Sesión iniciada, pero no se pudo guardar en el llavero."
                }
            } else {
                FluxiaSecureSession.deleteRefreshToken()
            }
        } catch {
            message = "No se ha podido autenticar o leer la nube: \(error.localizedDescription)"
        }
    }

    private func signOut() {
        FluxiaSecureSession.deleteRefreshToken()
        rememberSession = false
        identity = nil
        authSession = nil
        recordCount = nil
        cloudRecords = []
        password = ""
        message = nil
    }
}
#endif
