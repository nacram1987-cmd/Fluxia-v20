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
    @State private var showPasswordKeyboard = false
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
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 9) {
                            AsyncImage(url: URL(string: "https://nacram1987-cmd.github.io/Fluxia-v20/fluxia-icon.png")) { phase in
                                if let image = phase.image {
                                    image.resizable().scaledToFit()
                                } else {
                                    Image(systemName: "shield.lefthalf.filled")
                                        .resizable().scaledToFit().foregroundStyle(.secondary)
                                }
                            }
                            .frame(width: 30, height: 30)
                            Text("fluxia")
                                .font(.system(size: 27, weight: .semibold, design: .serif))
                            Text("ÉLITE BETA")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(.brown)
                            Spacer(minLength: 0)
                        }
                        .padding(.bottom, 5)

                        Text("Accede a tu cuenta")
                            .font(.headline)
                        TextField("Correo electrónico", text: $email)
                            .focused($emailFocused)
                            .textContentType(.username)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .textFieldStyle(.roundedBorder)
                            .submitLabel(.done)
                        HStack(spacing: 6) {
                            ForEach(["@", ".", ".com", "gmail.com"], id: \.self) { part in
                                Button(part) { insertEmailPart(part) }
                                    .frame(maxWidth: .infinity, minHeight: 32)
                                    .buttonStyle(.bordered)
                            }
                            Button(showEmailNumbers ? "−123" : "+123") {
                                emailFocused = false
                                showEmailNumbers.toggle()
                            }
                            .buttonStyle(.bordered)
                        }
                        .font(.system(size: 11))
                        if showEmailNumbers {
                            HStack(spacing: 3) {
                                ForEach(0..<10, id: \.self) { number in
                                    Button(String(number)) { email.append(String(number)) }
                                        .frame(maxWidth: .infinity, minHeight: 30)
                                        .buttonStyle(.bordered)
                                }
                            }
                            .font(.system(size: 11))
                        }
                        HStack(spacing: 8) {
                            Text("Contraseña").font(.subheadline.weight(.medium))
                            Spacer()
                            Button(showPasswordKeyboard ? "Ocultar teclado" : "Escribir contraseña") {
                                emailFocused = false
                                showPasswordKeyboard.toggle()
                            }
                            .font(.caption)
                        }
                        HStack(spacing: 7) {
                            Text(revealPassword ? password : String(repeating: "●", count: password.count))
                                .font(.system(size: 15, design: .monospaced))
                                .lineLimit(1)
                                .truncationMode(.head)
                                .frame(maxWidth: .infinity, minHeight: 31, alignment: .leading)
                                .accessibilityLabel("\(password.count) caracteres de contraseña")
                            Button {
                                revealPassword.toggle()
                            } label: {
                                Image(systemName: revealPassword ? "eye.slash" : "eye")
                            }
                            .accessibilityLabel(revealPassword ? "Ocultar contraseña" : "Mostrar contraseña")
                            Button {
                                if !password.isEmpty { password.removeLast() }
                            } label: {
                                Image(systemName: "delete.left")
                            }
                            .accessibilityLabel("Borrar último carácter")
                        }
                        .padding(.horizontal, 10)
                        .background(.white, in: RoundedRectangle(cornerRadius: 9))
                        .overlay(RoundedRectangle(cornerRadius: 9).stroke(.gray.opacity(0.25)))
                        Toggle("Recordar sesión", isOn: $rememberSession)
                            .font(.subheadline)
                            .tint(Color(red: 0.08, green: 0.27, blue: 0.43))
                        Button {
                            emailFocused = false
                            Task { await signIn() }
                        } label: {
                            HStack(spacing: 8) {
                                if isLoading { ProgressView().tint(.white) }
                                Text("Entrar")
                            }
                            .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color(red: 0.08, green: 0.27, blue: 0.43))
                        .disabled(isLoading || email.trimmingCharacters(in: .whitespaces).isEmpty || password.isEmpty || cloudConfiguration == nil)
                        if showPasswordKeyboard {
                            passwordKeyboard
                                .padding(.top, 3)
                        }
                        if cloudConfiguration == nil {
                            Text("Conexión Supabase pendiente de configurar.")
                                .font(.caption).foregroundStyle(.orange)
                        }
                        if let message {
                            Text(message).font(.caption).foregroundStyle(.red)
                        }
                        Text("Datos reales · lectura segura. La contraseña no se guarda.")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                    }
                    .padding(14)
                    .frame(maxWidth: 440)
                    .frame(maxWidth: .infinity)
                }
                .scrollDismissesKeyboard(.interactively)
                .background(Color(red: 0.97, green: 0.97, blue: 0.95))
                .safeAreaPadding(.bottom, 8)
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
        VStack(spacing: 3) {
            HStack(spacing: 2) {
                ForEach(Array("1234567890").map(String.init), id: \.self) { key in
                    passwordKey(key)
                }
            }
            ForEach(["qwertyuiop", "asdfghjkl", "zxcvbnm"], id: \.self) { row in
                HStack(spacing: 2) {
                    ForEach(Array(row).map(String.init), id: \.self) { letter in
                        passwordKey(upperCaseKeys ? letter.uppercased() : letter)
                    }
                }
            }
            HStack(spacing: 4) {
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
                HStack(spacing: 2) {
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
                .font(.system(size: 13, weight: .medium))
                .frame(maxWidth: .infinity, minHeight: 30)
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
