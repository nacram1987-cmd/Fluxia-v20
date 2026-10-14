import Foundation

/// Pure tenant-boundary checks for the future authenticated data layer.
/// This policy does not authenticate users or fetch records.
enum AccountIsolation {
    struct Record: Equatable {
        let id: String
        let ownerID: String
        let amountCents: Int64
    }

    enum Decision: Equatable {
        case allowed
        case denied
    }

    /// Fail closed: anonymous or mismatched accounts cannot read or change records.
    static func authorize(record: Record, authenticatedUserID: String?) -> Decision {
        guard let user = authenticatedUserID,
              !user.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              !record.ownerID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              !record.id.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              user == record.ownerID else { return .denied }
        return .allowed
    }

    /// Filtering is defensive only; backend row-level security is still mandatory.
    static func visibleRecords(_ records: [Record], authenticatedUserID: String?) -> [Record] {
        records.filter { authorize(record: $0, authenticatedUserID: authenticatedUserID) == .allowed }
    }
}
