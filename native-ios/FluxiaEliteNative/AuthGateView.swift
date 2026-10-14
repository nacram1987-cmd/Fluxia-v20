import SwiftUI

struct AuthGateView: View {
    @ObservedObject var session: AuthSessionModel
    let showDemo: () -> Void
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("FLUXIA ÉLITE")
                            .font(.system(.largeTitle, design: .rounded).weight(.bold))
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
                            .submitLabel(.next)
                        SecureField("Contraseña", text: $password)
                            .textContentType(.password)
                            .textFieldStyle(.roundedBorder)
                            .accessibilityLabel("Contraseña")
                            .submitLabel(.go)
                            .onSubmit { submitLogin() }
                        Button(action: submitLogin) {
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
                    Text("Los datos de demostración son sintéticos y no se sincronizan.")
                        .font(.caption)
                        .foregroundStyle(ElitePalette.ink.opacity(0.65))
                }
                .padding(24)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(ElitePalette.navy.ignoresSafeArea())
        }
    }

    private func submitLogin() {
        Task { await session.signIn(email: email, password: password) }
    }
}
