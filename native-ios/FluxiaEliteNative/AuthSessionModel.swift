import Foundation
import Combine
import Supabase

@MainActor
final class AuthSessionModel: ObservableObject {
    @Published private(set) var state: AuthAccessState
    @Published private(set) var isBusy = false
    @Published private(set) var message: String?

    private let client: SupabaseClient?
    private var authEventsTask: Task<Void, Never>?

    init(info: [String: Any] = Bundle.main.infoDictionary ?? [:]) {
        let rawURL = (info["FluxiaSupabaseURL"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let key = (info["FluxiaSupabasePublishableKey"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        if AuthAccessState.isValidConfiguration(url: rawURL, publishableKey: key),
           let url = URL(string: rawURL) {
            client = SupabaseClient(supabaseURL: url, supabaseKey: key)
            state = .restoring
        } else {
            client = nil
            state = .configurationMissing
        }
    }

    deinit { authEventsTask?.cancel() }

    var isConfigured: Bool { client != nil }

    func financeProfiles() async throws -> [FluxiaCloudFinanceRepository.Profile] {
        guard let client, case .authenticated(let ownerID) = state,
              AuthAccessState.mayReadPersonalData(state: state, requestedOwnerID: ownerID) else {
            throw FinanceReadError.unauthenticated
        }
        return try await FluxiaCloudFinanceRepository(client: client).profiles(ownerID: ownerID)
    }

    func financePreview(profileID: String) async throws -> [FluxiaCloudFinanceRepository.Section] {
        guard let client, case .authenticated(let ownerID) = state,
              AuthAccessState.mayReadPersonalData(state: state, requestedOwnerID: ownerID) else {
            throw FinanceReadError.unauthenticated
        }
        return try await FluxiaCloudFinanceRepository(client: client).load(ownerID: ownerID, profileID: profileID)
    }

    func start() {
        guard let client, authEventsTask == nil else { return }
        authEventsTask = Task {
            for await (event, session) in await client.auth.authStateChanges {
                guard !Task.isCancelled else { break }
                switch event {
                case .initialSession, .signedIn, .tokenRefreshed, .userUpdated:
                    if let session {
                        state = .authenticated(ownerID: session.user.id.uuidString)
                    } else {
                        state = .signedOut
                    }
                case .signedOut, .userDeleted:
                    state = .signedOut
                default:
                    break
                }
            }
        }
    }

    func signIn(email: String, password: String) async {
        guard let client else { state = .configurationMissing; return }
        let normalizedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        guard normalizedEmail.contains("@"), !password.isEmpty else {
            message = "Introduce un correo y una contraseña válidos."
            return
        }
        isBusy = true
        message = nil
        defer { isBusy = false }
        do {
            let response = try await client.auth.signIn(email: normalizedEmail, password: password)
            state = .authenticated(ownerID: response.user.id.uuidString)
        } catch {
            // Avoid exposing provider details, tokens, or account-enumeration signals.
            message = "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo."
        }
    }

    func signOut() async {
        guard let client else { state = .configurationMissing; return }
        isBusy = true
        message = nil
        defer { isBusy = false }
        do {
            try await client.auth.signOut()
            state = .signedOut
        } catch {
            message = "No se pudo cerrar la sesión. Inténtalo de nuevo."
        }
    }

    enum FinanceReadError: Error { case unauthenticated }
}
