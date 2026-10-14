import CryptoKit
import Foundation
import Security

/// Encrypted, owner-partitioned local ledger. This is an offline persistence layer;
/// it does not imply cloud sync or server-side isolation.
final class EncryptedLedgerStore {
    struct Entry: Codable, Equatable {
        enum Kind: String, Codable { case income, fixedExpense, variableExpense, plannedProvision, provisionContribution }
        let id: String
        let ownerID: String
        let year: Int
        let month: Int
        let kind: Kind
        let amountCents: Int64
        let operationID: String
    }

    enum AppendResult: Equatable { case inserted(revision: UInt64), duplicateOperation, rejected }
    enum StoreError: Error { case keyUnavailable, corruptOrUnauthenticData, ioFailure }

    typealias KeyProvider = (String) -> SymmetricKey?

    private struct Snapshot: Codable {
        struct AuditEvent: Codable {
            let operationID: String
            let recordID: String
            let action: String
            let revision: UInt64
        }
        var ownerID: String
        var revision: UInt64 = 0
        var entries: [Entry] = []
        var tombstones: Set<String> = []
        var operationIDs: Set<String> = []
        var audit: [AuditEvent] = []
    }

    private let directoryURL: URL
    private let keyProvider: KeyProvider
    private static let transactionLock = NSRecursiveLock()

    init(directoryURL: URL, keyProvider: @escaping KeyProvider = KeychainLedgerKey.key(for:)) {
        self.directoryURL = directoryURL
        self.keyProvider = keyProvider
    }

    func entries(ownerID: String, authenticatedOwnerID: String?) throws -> [Entry] {
        Self.transactionLock.lock(); defer { Self.transactionLock.unlock() }
        guard Self.valid(ownerID), authenticatedOwnerID == ownerID else { return [] }
        return try readSnapshot(ownerID: ownerID).entries
    }

    /// Appends are serialized and idempotent. An explicit tombstone is terminal:
    /// a later replay cannot recreate the same record identifier.
    func append(_ entry: Entry, authenticatedOwnerID: String?) throws -> AppendResult {
        Self.transactionLock.lock(); defer { Self.transactionLock.unlock() }
        guard Self.valid(entry.ownerID), authenticatedOwnerID == entry.ownerID,
              Self.valid(entry.id), Self.valid(entry.operationID),
              (1...9999).contains(entry.year), (1...12).contains(entry.month), entry.amountCents > 0 else {
            return .rejected
        }
        var snapshot = try readSnapshot(ownerID: entry.ownerID)
        if snapshot.operationIDs.contains(entry.operationID) { return .duplicateOperation }
        guard !snapshot.tombstones.contains(entry.id), !snapshot.entries.contains(where: { $0.id == entry.id }),
              snapshot.revision < UInt64.max else { return .rejected }

        let next = snapshot.revision + 1
        snapshot.entries.append(entry)
        snapshot.operationIDs.insert(entry.operationID)
        snapshot.audit.append(.init(operationID: entry.operationID, recordID: entry.id, action: "append", revision: next))
        snapshot.revision = next
        try write(snapshot)
        return .inserted(revision: next)
    }

    /// Explicit deletion records a permanent tombstone and audit event. This
    /// minimal foundation deliberately offers no automatic restore path.
    func permanentlyDelete(recordID: String, ownerID: String, operationID: String,
                           authenticatedOwnerID: String?) throws -> AppendResult {
        Self.transactionLock.lock(); defer { Self.transactionLock.unlock() }
        guard Self.valid(ownerID), authenticatedOwnerID == ownerID,
              Self.valid(recordID), Self.valid(operationID) else { return .rejected }
        var snapshot = try readSnapshot(ownerID: ownerID)
        if snapshot.operationIDs.contains(operationID) { return .duplicateOperation }
        guard snapshot.entries.contains(where: { $0.id == recordID }),
              !snapshot.tombstones.contains(recordID), snapshot.revision < UInt64.max else { return .rejected }
        let next = snapshot.revision + 1
        snapshot.entries.removeAll { $0.id == recordID }
        snapshot.tombstones.insert(recordID)
        snapshot.operationIDs.insert(operationID)
        snapshot.audit.append(.init(operationID: operationID, recordID: recordID, action: "permanent-delete", revision: next))
        snapshot.revision = next
        try write(snapshot)
        return .inserted(revision: next)
    }

    private func readSnapshot(ownerID: String) throws -> Snapshot {
        guard let key = keyProvider(ownerID) else { throw StoreError.keyUnavailable }
        let url = fileURL(ownerID: ownerID)
        guard FileManager.default.fileExists(atPath: url.path) else { return Snapshot(ownerID: ownerID) }
        do {
            let sealed = try Data(contentsOf: url)
            let box = try AES.GCM.SealedBox(combined: sealed)
            let clear = try AES.GCM.open(box, using: key)
            let snapshot = try JSONDecoder().decode(Snapshot.self, from: clear)
            guard snapshot.ownerID == ownerID,
                  Set(snapshot.entries.map(\.id)).count == snapshot.entries.count,
                  snapshot.entries.allSatisfy({ $0.ownerID == ownerID && !snapshot.tombstones.contains($0.id) }) else {
                throw StoreError.corruptOrUnauthenticData
            }
            return snapshot
        } catch { throw StoreError.corruptOrUnauthenticData }
    }

    private func write(_ snapshot: Snapshot) throws {
        guard let key = keyProvider(snapshot.ownerID) else { throw StoreError.keyUnavailable }
        do {
            try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
            let clear = try JSONEncoder().encode(snapshot)
            let sealed = try AES.GCM.seal(clear, using: key)
            guard let combined = sealed.combined else { throw StoreError.ioFailure }
            try combined.write(to: fileURL(ownerID: snapshot.ownerID), options: .atomic)
            #if os(iOS)
            try FileManager.default.setAttributes([.protectionKey: FileProtectionType.complete],
                                                   ofItemAtPath: fileURL(ownerID: snapshot.ownerID).path)
            #endif
        } catch { throw StoreError.ioFailure }
    }

    private func fileURL(ownerID: String) -> URL {
        let digest = SHA256.hash(data: Data(ownerID.utf8)).map { String(format: "%02x", $0) }.joined()
        return directoryURL.appendingPathComponent("ledger-\(digest).fluxia", isDirectory: false)
    }

    private static func valid(_ value: String) -> Bool {
        !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
}

private enum KeychainLedgerKey {
    static func key(for ownerID: String) -> SymmetricKey? {
        let service = Bundle.main.bundleIdentifier ?? "com.fluxia.elite.native"
        let account = "ledger-aes-gcm-\(ownerID)"
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                    kSecAttrService as String: service,
                                    kSecAttrAccount as String: account,
                                    kSecReturnData as String: true,
                                    kSecMatchLimit as String: kSecMatchLimitOne]
        var result: CFTypeRef?
        if SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
           let data = result as? Data { return SymmetricKey(data: data) }

        let data = Data((0..<32).map { _ in UInt8.random(in: .min ... .max) })
        let insert: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                     kSecAttrService as String: service,
                                     kSecAttrAccount as String: account,
                                     kSecValueData as String: data,
                                     kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly]
        let status = SecItemAdd(insert as CFDictionary, nil)
        if status == errSecSuccess { return SymmetricKey(data: data) }
        // A parallel creator may have won; read the committed key, never replace it.
        result = nil
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let existing = result as? Data else { return nil }
        return SymmetricKey(data: existing)
    }
}
