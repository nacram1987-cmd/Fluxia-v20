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
    @State private var showEmailNumbers = false
    @State private var showPasswordKeyboard = true
    @State private var revealPassword = false
    @State private var upperCaseKeys = false
    @State private var symbolKeys = false
    @FocusState private var emailFocused: Bool
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
                ScrollView {
                VStack(alignment: .leading, spacing: 14) {
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
                        .font(.headline)
                        .lineLimit(2)
                        .minimumScaleFactor(0.8)
                    TextField("Correo electrónico", text: $email)
                        .focused($emailFocused)
                        .textContentType(.username)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .textFieldStyle(.roundedBorder)
                    HStack(spacing: 8) {
                        Button("@") { insertEmailPart("@") }
                        Button(".") { insertEmailPart(".") }
                        Button(".com") { insertEmailPart(".com") }
                        Button("gmail.com") { insertEmailPart("gmail.com") }
                    }
                    .buttonStyle(.bordered)
                    .font(.subheadline)
                    .disabled(isLoading)
                    .accessibilityLabel("Atajos para completar el correo")
                    HStack(spacing: 8) {
                        Button(showEmailNumbers ? "Ocultar números" : "Números para correo") {
                            emailFocused = false
                            showEmailNumbers.toggle()
                        }
                        .buttonStyle(.bordered)
                        .font(.caption)
                        Spacer()
                    }
                    if showEmailNumbers {
                        HStack(spacing: 5) {
                            ForEach(0..<10, id: \.self) { n in
                                Button(String(n)) { email.append(String(n)) }
                                    .frame(maxWidth: .infinity, minHeight: 36)
                                    .buttonStyle(.bordered)
                                    .font(.caption)
                            }
                        }
                    }
                    Text("Contraseña").font(.subheadline.bold())
                    HStack(spacing: 8) {
                        Text(revealPassword ? password : String(repeating: "●", count: password.count))
                            .font(.system(size: 18, weight: .medium, design: .monospaced))
                            .lineLimit(1)
                            .frame(maxWidth: .infinity, minHeight: 36, alignment: .leading)
                            .accessibilityLabel("\(password.count) caracteres de contraseña")
                        Button {
                            revealPassword.toggle()
                        } label: {
                            Image(systemName: revealPassword ? "eye.slash" : "eye")
                        }
                        .accessibilityLabel(revealPassword ? "Ocultar contraseña" : "Mostrar contraseña")
                        Button {
                            showPasswordKeyboard.toggle()
                            emailFocused = false
                        } label: {
                            Image(systemName: "keyboard")
                        }
                        .accessibilityLabel("Mostrar u ocultar teclado integrado")
                    }
                    .padding(.horizontal, 12)
                    .background(.white, in: RoundedRectangle(cornerRadius: 8))
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.gray.opacity(0.28)))
                    if showPasswordKeyboard {
                        Text("Teclado integrado: mezcla letras, números y símbolos sin perder lo escrito")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        passwordKeyboard
                    }
                    Toggle("Recordar sesión en este dispositivo", isOn: $rememberSession)
                        .font(.subheadline)
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
                .padding(16)
                .frame(maxWidth: 480)
                }
                .scrollDismissesKeyboard(.interactively)
                .safeAreaPadding(.bottom, 20)
            }
        }
        .task {
            guard !didAttemptRestore else { return }
            didAttemptRestore = true
            await restoreSession()
        }
    }

    private func insertEmailPart(_ text: String) {
        emailFocused = false
        email.append(text)
    }

    private var passwordKeyboard: some View {
        VStack(spacing: 6) {
            HStack(spacing: 4) {
                ForEach(Array("1234567890").map(String.init), id: \.self) { key in
                    passwordKey(key)
                }
            }
            ForEach(["qwertyuiop", "asdfghjkl", "zxcvbnm"], id: \.self) { row in
                HStack(spacing: 4) {
                    ForEach(Array(row).map(String.init), id: \.self) { letter in
                        passwordKey(upperCaseKeys ? letter.uppercased() : letter)
                    }
                }
            }
            HStack(spacing: 6) {
                Button(upperCaseKeys ? "MAYÚS ✓" : "Mayús") { upperCaseKeys.toggle() }
                    .buttonStyle(.bordered)
                Button(symbolKeys ? "Símbolos ✓" : "Símbolos") { symbolKeys.toggle() }
                    .buttonStyle(.bordered)
                Spacer(minLength: 0)
                Button {
                    if !password.isEmpty { password.removeLast() }
                } label: {
                    Image(systemName: "delete.left")
                }
                .buttonStyle(.bordered)
                .accessibilityLabel("Borrar último carácter")
                Button("Listo") { showPasswordKeyboard = false }
                    .buttonStyle(.borderedProminent)
            }
            if symbolKeys {
                HStack(spacing: 4) {
                    ForEach(["@", ".", "-", "_", "!", "?", "#", "$", "%", "&"], id: \.self) { key in
                        passwordKey(key)
                    }
                }
            }
        }
        .disabled(isLoading)
    }

    private func passwordKey(_ value: String) -> some View {
        Button {
            // Append directly to one bound value. No keyboard focus changes or field replacement.
            password.append(value)
        } label: {
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .frame(maxWidth: .infinity, minHeight: 38)
                .contentShape(Rectangle())
        }
        .buttonStyle(.bordered)
        .accessibilityLabel("Añadir " + value + " a la contraseña")
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
