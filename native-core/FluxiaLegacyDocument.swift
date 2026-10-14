import Foundation

/// No legacy key is trusted by suffix alone. The HTML resolver must first
/// establish the canonical exact key for each module and authenticated profile.
public enum FluxiaLegacyDocument {
    public enum Classification: Equatable {
        case candidate(String)
        case historical
        case excluded
    }

    public static func classify(_ key: String, canonicalKeys: [String: String] = [:]) -> Classification {
        let lower = key.lowercased()
        let forbidden = ["backup", "espejo", "papelera", "borrados",
                         "blacklist", "dismiss", "rechaz", "tombstone"]
        if forbidden.contains(where: { lower.contains($0) }) { return .historical }
        // No default auto-import: global aliases and profile copies coexist.
        // Caller supplies exact module -> canonical key after HTML parity audit.
        for (module, exactKey) in canonicalKeys where key == exactKey {
            return .candidate(module)
        }
        return .excluded
    }
}
