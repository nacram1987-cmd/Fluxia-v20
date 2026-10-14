#if canImport(Security)
import Foundation
import Security

/// Stores only a rotating Supabase refresh token, never the password.
enum FluxiaSecureSession {
    private static let service = "com.fluxia.elitebeta.session"
    private static let account = "refresh-token"

    static func saveRefreshToken(_ token: String) -> Bool {
        guard let data = token.data(using: .utf8), !data.isEmpty else { return false }
        deleteRefreshToken()
        let attributes: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
            kSecValueData as String: data
        ]
        return SecItemAdd(attributes as CFDictionary, nil) == errSecSuccess
    }

    static func readRefreshToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecReturnData as String: true
        ]
        var result: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func deleteRefreshToken() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        SecItemDelete(query as CFDictionary)
    }
}
#endif
