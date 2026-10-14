import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

/// Supabase password sign-in for the real Fluxia account. No service-role key,
/// no persisted password, no anonymous fallback, no fake user.
public struct FluxiaAuthClient: Sendable {
    public struct Session: Decodable, Sendable {
        public struct User: Decodable, Sendable {
            public let id: UUID
        }
        public let access_token: String
        public let refresh_token: String
        public let expires_in: Int
        public let user: User
    }
    public enum AuthError: Error {
        case invalidConfiguration, missingCredentials, badResponse(Int), invalidPayload
    }
    public let projectURL: URL
    public let publishableKey: String

    public init(projectURL: URL, publishableKey: String) {
        self.projectURL = projectURL
        self.publishableKey = publishableKey
    }

    public func signIn(email: String, password: String, session: URLSession = .shared) async throws -> Session {
        guard projectURL.scheme == "https", !publishableKey.isEmpty else { throw AuthError.invalidConfiguration }
        guard !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, !password.isEmpty else {
            throw AuthError.missingCredentials
        }
        let url = projectURL.appendingPathComponent("auth/v1/token")
        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "grant_type", value: "password")]
        guard let endpoint = components.url else { throw AuthError.invalidConfiguration }
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue(publishableKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.cachePolicy = .reloadIgnoringLocalCacheData
        request.httpBody = try JSONSerialization.data(withJSONObject: ["email": email, "password": password])
        let (data, response) = try await session.data(for: request)
        guard let response = response as? HTTPURLResponse else { throw AuthError.invalidPayload }
        guard (200..<300).contains(response.statusCode) else { throw AuthError.badResponse(response.statusCode) }
        let signedIn = try JSONDecoder().decode(Session.self, from: data)
        guard !signedIn.access_token.isEmpty, !signedIn.refresh_token.isEmpty else { throw AuthError.invalidPayload }
        return signedIn
    }

    public func refresh(_ token: String, session: URLSession = .shared) async throws -> Session {
        guard projectURL.scheme == "https", !publishableKey.isEmpty else { throw AuthError.invalidConfiguration }
        guard !token.isEmpty else { throw AuthError.missingCredentials }
        var components = URLComponents(url: projectURL.appendingPathComponent("auth/v1/token"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "grant_type", value: "refresh_token")]
        guard let endpoint = components.url else { throw AuthError.invalidConfiguration }
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue(publishableKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["refresh_token": token])
        let (data, response) = try await session.data(for: request)
        guard let response = response as? HTTPURLResponse else { throw AuthError.invalidPayload }
        guard (200..<300).contains(response.statusCode) else { throw AuthError.badResponse(response.statusCode) }
        return try JSONDecoder().decode(Session.self, from: data)
    }
}
