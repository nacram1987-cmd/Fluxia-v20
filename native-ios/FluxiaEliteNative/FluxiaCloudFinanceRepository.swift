import Foundation
import Supabase

/// Read-only bridge to the existing PWA key/value ledger. It selects only the
/// active owner's whitelisted finance keys; no bank tables or writes are used.
struct FluxiaCloudFinanceRepository {
    struct Profile: Identifiable, Equatable {
        /// Empty ID represents the documented legacy, unscoped profile.
        let id: String
        var title: String { id.isEmpty ? "Perfil principal" : "Perfil …\(id.suffix(6))" }
    }

    struct Item: Identifiable {
        let id: String
        let title: String
        let amountCents: Int64?
        let detail: String
    }

    struct Section: Identifiable {
        let id: String
        let title: String
        let items: [Item]
        let warning: String?
    }

    private struct KeyRow: Decodable { let clave: String }
    private struct ValueRow: Decodable { let clave: String; let v: String? }

    private static let sourceKeys = [
        "v2_ingresos", "v2_fijos", "v2_movimientos", "v2_provisiones",
        "v2_financiaciones", "v2_compartidos", "v2_config_plan"
    ]
    private static let displayKeys: [(String, String)] = [
        ("v2_ingresos", "Ingresos"), ("v2_fijos", "Gastos fijos"),
        ("v2_movimientos", "Gastos variables"), ("v2_provisiones", "Huchas"),
        ("v2_financiaciones", "Financiaciones"), ("v2_compartidos", "Compartidos")
    ]

    private let client: SupabaseClient
    init(client: SupabaseClient) { self.client = client }

    /// Lists profile identifiers only. It never requests financial values here.
    func profiles(ownerID: String) async throws -> [Profile] {
        let rows: [KeyRow] = try await client.from("fluxia_datos")
            .select("clave")
            .eq("user_id", value: ownerID)
            .execute().value
        var ids = Set<String>()
        var hasLegacy = false
        for row in rows {
            if Self.sourceKeys.contains(row.clave) { hasLegacy = true; continue }
            guard row.clave.hasPrefix("profile:"), let separator = row.clave.range(of: ":", options: .backwards) else { continue }
            let suffix = String(row.clave[separator.upperBound...])
            guard Self.sourceKeys.contains(suffix) else { continue }
            let encodedID = String(row.clave[row.clave.index(row.clave.startIndex, offsetBy: 8)..<separator.lowerBound])
            guard let profileID = encodedID.removingPercentEncoding, !profileID.isEmpty else { continue }
            ids.insert(profileID)
        }
        var result = ids.map(Profile.init(id:)).sorted { $0.title < $1.title }
        if hasLegacy { result.append(Profile(id: "")) }
        return result
    }

    /// Loads exact known finance keys for one selected profile; no writes occur.
    func load(ownerID: String, profileID: String) async throws -> [Section] {
        let javascriptURIComponentSet = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.!~*'()")
        let encodedProfile = profileID.addingPercentEncoding(withAllowedCharacters: javascriptURIComponentSet) ?? profileID
        let prefix = profileID.isEmpty ? "" : "profile:\(encodedProfile):"
        let requested = Self.sourceKeys.map { prefix + $0 }
        let rows: [ValueRow] = try await client.from("fluxia_datos")
            .select("clave, v")
            .eq("user_id", value: ownerID)
            .in("clave", values: requested)
            .execute().value
        let values = Dictionary(rows.map { ($0.clave, $0.v ?? "") }, uniquingKeysWith: { _, newest in newest })
        return Self.displayKeys.map { key, title in
            let storedValue = values[prefix + key] ?? ""
            let parsed = Self.decodeArray(storedValue)
            return Section(id: key, title: title, items: parsed.items, warning: parsed.warning)
        }
    }

    private static func decodeArray(_ raw: String) -> (items: [Item], warning: String?) {
        guard !raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return ([], nil) }
        guard let data = raw.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) else {
            return ([], "El bloque existe, pero no se pudo interpretar con seguridad.")
        }
        let array: [[String: Any]]
        if let direct = json as? [[String: Any]] { array = direct }
        else if let object = json as? [String: Any], let nested = object["data"] as? [[String: Any]] { array = nested }
        else { return ([], "El formato de este bloque necesita una adaptación antes de mostrarlo.") }

        let items = array.enumerated().map { index, entry in
            let title = firstString(entry, keys: ["concepto", "nombre", "descripcion", "contraparte", "categoria"])
                ?? "Movimiento \(index + 1)"
            let amount = firstAmount(entry, keys: ["importe", "importe_total", "cuota", "importeMensual", "objetivo"])
            let date = firstString(entry, keys: ["fecha", "pagadoEl", "mes", "vencimiento"])
            let status = firstString(entry, keys: ["estado", "status"])
            return Item(id: firstString(entry, keys: ["id"]) ?? "\(index)-\(title)", title: title,
                        amountCents: amount, detail: [date, status].compactMap { $0 }.joined(separator: " · "))
        }
        return (items, nil)
    }

    private static func firstString(_ object: [String: Any], keys: [String]) -> String? {
        for key in keys {
            guard let value = object[key], !(value is NSNull) else { continue }
            if let text = value as? String, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return text }
            if let number = value as? NSNumber { return number.stringValue }
        }
        return nil
    }

    private static func firstAmount(_ object: [String: Any], keys: [String]) -> Int64? {
        for key in keys {
            guard let value = object[key], !(value is NSNull) else { continue }
            let text = (value as? String) ?? (value as? NSNumber)?.stringValue
            guard let text else { continue }
            let normalized = text.replacingOccurrences(of: ",", with: ".")
            guard let euros = Decimal(string: normalized, locale: Locale(identifier: "en_US_POSIX")) else { continue }
            var cents = euros * Decimal(100)
            var rounded = Decimal()
            NSDecimalRound(&rounded, &cents, 0, .plain)
            guard rounded == cents, rounded <= Decimal(Int64.max) else { continue }
            return NSDecimalNumber(decimal: rounded).int64Value
        }
        return nil
    }
}
