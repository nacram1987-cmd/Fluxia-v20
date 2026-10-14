import Foundation

/// A conservative classifier for the legacy Fluxia HTML cloud documents.
/// Never treats backup, mirror, trash or bank staging documents as active ledger entries.
public enum FluxiaLegacyDocument {
    public enum Classification: Equatable {
        case candidate(String)
        case historical
        case excluded
    }

    public static func classify(_ key: String) -> Classification {
        let k = key.lowercased()
        if k.hasPrefix("backup:") || k.contains("backup") || k.contains("espejo") ||
            k.contains("papelera") || k.contains("borrados") || k.contains("blacklist") ||
            k.contains("dismiss") || k.contains("rechaz") || k.contains("tombstone") {
            return .historical
        }
        if k.contains("banco_") || k.contains("sync") || k.contains("cache") ||
            k.contains("session") || k.contains("token") {
            return .excluded
        }
        let modules = ["ingresos", "movimientos", "fijos", "provisiones",
                       "usos", "rescates", "compartidos", "financiaciones",
                       "categorias", "config_plan"]
        for module in modules where k.hasSuffix("planrescate_v2_\(module)") {
            return .candidate(module)
        }
        return .excluded
    }
}
