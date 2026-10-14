import SwiftUI

struct AuthenticatedSessionView: View {
    @ObservedObject var session: AuthSessionModel

    var body: some View {
        ScrollView {
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
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ElitePalette.navy.ignoresSafeArea())
        .foregroundStyle(ElitePalette.ink)
        .accessibilityIdentifier("authenticated-no-ledger")
    }
}
