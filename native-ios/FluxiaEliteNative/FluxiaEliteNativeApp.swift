import SwiftUI

@main
struct FluxiaEliteNativeApp: App {
    var body: some Scene {
        WindowGroup {
            NativeAccessRoot()
        }
    }
}

private struct NativeAccessRoot: View {
    @StateObject private var session = AuthSessionModel()
    @State private var isShowingDemo = ProcessInfo.processInfo.arguments.contains("-fluxia.demoMode")

    var body: some View {
        Group {
            if isShowingDemo {
                ContentView(onExitDemo: { isShowingDemo = false })
            } else {
                switch session.state {
                case .restoring:
                    ProgressView("Comprobando sesión segura…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(ElitePalette.navy)
                        .foregroundStyle(ElitePalette.ink)
                case .authenticated:
                    AuthenticatedLanding(session: session)
                case .configurationMissing, .signedOut, .failed:
                    SignInLanding(session: session, showDemo: { isShowingDemo = true })
                }
            }
        }
        .task { session.start() }
    }
}

private struct SignInLanding: View {
    @ObservedObject var session: AuthSessionModel
    let showDemo: () -> Void
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                Spacer()
                VStack(alignment: .leading, spacing: 8) {
                    Text("FLUXIA ÉLITE")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .tracking(2)
                    Text("Tus finanzas, bajo tu control.")
                        .foregroundStyle(ElitePalette.ink.opacity(0.72))
                }
                .foregroundStyle(ElitePalette.ink)

                if session.isConfigured {
                    TextField("Correo electrónico", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .textFieldStyle(.roundedBorder)
                        .accessibilityLabel("Correo electrónico")
                    SecureField("Contraseña", text: $password)
                        .textContentType(.password)
                        .textFieldStyle(.roundedBorder)
                        .accessibilityLabel("Contraseña")
                    Button {
                        Task { await session.signIn(email: email, password: password) }
                    } label: {
                        HStack {
                            Spacer()
                            if session.isBusy { ProgressView().tint(.white) }
                            Text("Iniciar sesión").fontWeight(.semibold)
                            Spacer()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(ElitePalette.gold)
                    .disabled(session.isBusy)
                    Text("La sesión se almacena en el llavero seguro del dispositivo.")
                        .font(.footnote)
                        .foregroundStyle(ElitePalette.ink.opacity(0.7))
                } else {
                    Label("Configuración de acceso pendiente", systemImage: "lock.shield")
                        .font(.headline)
                        .foregroundStyle(ElitePalette.gold)
                    Text("Este build no tiene configuración de autenticación. No se han cargado datos personales.")
                        .font(.subheadline)
                        .foregroundStyle(ElitePalette.ink.opacity(0.78))
                }

                if let message = session.message {
                    Text(message).font(.footnote).foregroundStyle(.red)
                        .accessibilityLabel("Error de acceso: \(message)")
                }
                Button("Explorar demo con datos ficticios", action: showDemo)
                    .buttonStyle(.bordered)
                    .tint(ElitePalette.gold)
                Spacer()
                Text("Los datos de demostración son sintéticos y no se sincronizan.")
                    .font(.caption)
                    .foregroundStyle(ElitePalette.ink.opacity(0.65))
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(ElitePalette.navy.ignoresSafeArea())
        }
        .preferredColorScheme(UserDefaults.standard.bool(forKey: "fluxia.elite.darkMode") ? .dark : .light)
    }
}

private struct AuthenticatedLanding: View {
    @ObservedObject var session: AuthSessionModel

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Sesión segura activa").font(.title2.bold())
            Label("Identidad autenticada", systemImage: "checkmark.shield.fill")
                .foregroundStyle(ElitePalette.gold)
            Text("La sesión se ha restaurado correctamente. El ledger financiero todavía no está conectado, por lo que esta versión no consulta ni muestra movimientos.")
                .foregroundStyle(ElitePalette.ink.opacity(0.78))
            Button("Cerrar sesión") { Task { await session.signOut() } }
                .buttonStyle(.borderedProminent)
                .tint(ElitePalette.gold)
                .disabled(session.isBusy)
            if let message = session.message {
                Text(message).font(.footnote).foregroundStyle(.red)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .background(ElitePalette.navy.ignoresSafeArea())
        .foregroundStyle(ElitePalette.ink)
        .accessibilityIdentifier("authenticated-no-ledger")
    }
}
