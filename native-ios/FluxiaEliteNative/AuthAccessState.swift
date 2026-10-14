import Foundation

/// Presentation gate only. A signed-in identity never implies that financial storage is enabled.
enum AuthAccessState: Equatable {
    case restoring
    case configurationMissing
    case signedOut
    case authenticated(ownerID: String)
    case failed

    static func isValidConfiguration(url rawURL: String, publishableKey: String) -> Bool {
        let urlString = rawURL.trimmingCharacters(in: .whitespacesAndNewlines)
        let key = publishableKey.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let components = URLComponents(string: urlString) else { return false }
        return components.scheme?.lowercased() == "https"
            && components.host != nil
            && components.user == nil
            && components.password == nil
            && key.hasPrefix("sb_publishable_")
            && !key.contains("\n")
            && !key.contains("\r")
    }

    var mayShowPersonalData: Bool {
        if case .authenticated(let ownerID) = self {
            return !ownerID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
        return false
    }

    static func mayReadPersonalData(state: AuthAccessState, requestedOwnerID: String?) -> Bool {
        guard state.mayShowPersonalData,
              case .authenticated(let sessionOwnerID) = state,
              let requestedOwnerID else { return false }
        let owner = sessionOwnerID.trimmingCharacters(in: .whitespacesAndNewlines)
        let requested = requestedOwnerID.trimmingCharacters(in: .whitespacesAndNewlines)
        return !owner.isEmpty && owner == requested
    }
}
