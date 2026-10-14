import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

/// Read-only gateway to the existing Fluxia HTML key/value cloud store.
/// Requires a user-scoped Supabase access token. Never embeds privileged keys.
public struct FluxiaCloudReader {
    public struct Record: Decodable, Sendable {
        public let user_id: UUID
        public let clave: String
        public let v: String?
        public let t: Int64?
        public let updated_at: String?
    }
    public enum ReaderError: Error {
        case invalidConfiguration, unauthenticated, badResponse(Int), invalidPayload
    }
    public let projectURL: URL
    public let publishableKey: String
    public init(projectURL: URL, publishableKey: String) {
        self.projectURL = projectURL
        self.publishableKey = publishableKey
    }
    /// No access token -> no request, no stale data from another profile.
    /// Explicit user filter complements (never replaces) server-side RLS.
    public func fetchPage(ownerID: UUID, accessToken: String, offset: Int, pageSize: Int = 250,
                          session: URLSession = .shared) async throws -> [Record] {
        guard projectURL.scheme == "https", !publishableKey.isEmpty, pageSize > 0,
              pageSize <= 1000, offset >= 0 else { throw ReaderError.invalidConfiguration }
        guard !accessToken.isEmpty else { throw ReaderError.unauthenticated }
        var components = URLComponents(url: projectURL.appendingPathComponent("rest/v1/fluxia_datos"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "select", value: "user_id,clave,v,t,updated_at"),
            URLQueryItem(name: "user_id", value: "eq.\(ownerID.uuidString.lowercased())"),
            URLQueryItem(name: "order", value: "clave.asc"),
            URLQueryItem(name: "limit", value: String(pageSize)),
            URLQueryItem(name: "offset", value: String(offset))
        ]
        guard let url = components.url else { throw ReaderError.invalidConfiguration }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(publishableKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.cachePolicy = .reloadIgnoringLocalCacheData
        let (data, response) = try await session.data(for: request)
        guard let response = response as? HTTPURLResponse else { throw ReaderError.invalidPayload }
        guard (200..<300).contains(response.statusCode) else { throw ReaderError.badResponse(response.statusCode) }
        return try JSONDecoder().decode([Record].self, from: data)
    }

    public func fetchAll(ownerID: UUID, accessToken: String,
                         session: URLSession = .shared) async throws -> [Record] {
        var result: [Record] = []
        var offset = 0
        while true {
            try Task.checkCancellation()
            let page = try await fetchPage(ownerID: ownerID, accessToken: accessToken,
                                           offset: offset, session: session)
            result.append(contentsOf: page)
            if page.count < 250 { return result }
            offset += page.count
        }
    }
    /// Strict audit reader: only six known HTML financial arrays.
    /// This intentionally excludes bank tokens, credentials, backups and trash.
    public func fetchCanonicalFinance(ownerID: UUID, accessToken: String,
                                      session: URLSession = .shared) async throws -> [Record] {
        let keys = [
            "planRescate_v2_movimientos",
            "planRescate_v2_ingresos",
            "planRescate_v2_fijos",
            "planRescate_v2_provisiones",
            "planRescate_v2_financiaciones",
            "planRescate_v2_compartidos"
        ]
        guard projectURL.scheme == "https", !publishableKey.isEmpty else {
            throw ReaderError.invalidConfiguration
        }
        guard !accessToken.isEmpty else { throw ReaderError.unauthenticated }
        var components = URLComponents(
            url: projectURL.appendingPathComponent("rest/v1/fluxia_datos"),
            resolvingAgainstBaseURL: false
        )!
        components.queryItems = [
            URLQueryItem(name: "select", value: "user_id,clave,v,t,updated_at"),
            URLQueryItem(name: "user_id", value: "eq.\(ownerID.uuidString.lowercased())"),
            URLQueryItem(name: "clave", value: "in.(\(keys.joined(separator: ",")))"),
            URLQueryItem(name: "limit", value: "20")
        ]
        guard let url = components.url else { throw ReaderError.invalidConfiguration }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(publishableKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.cachePolicy = .reloadIgnoringLocalCacheData
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw ReaderError.invalidPayload }
        guard (200..<300).contains(http.statusCode) else { throw ReaderError.badResponse(http.statusCode) }
        let rows = try JSONDecoder().decode([Record].self, from: data)
        guard rows.allSatisfy({ $0.user_id == ownerID && keys.contains($0.clave) }) else {
            throw ReaderError.invalidPayload
        }
        return rows
    }

}
