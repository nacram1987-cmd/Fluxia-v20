import Foundation

/// Domain-only lifecycle state machine for a future ledger repository.
/// This value type is in-memory: it does not provide persistence or authentication.
enum LedgerLifecycle {
    enum State: String, Equatable {
        case active
        case archived
        case trashed
        /// Terminal tombstone. A deleted record ID must not be recreated by replay.
        case deleted
    }

    enum Action: Equatable {
        case archive
        case unarchive
        case moveToTrash
        case restore
        case permanentlyDelete
    }

    enum Disposition: Equatable {
        case applied
        case duplicateOperation
        case rejected
    }

    struct AuditEvent: Equatable {
        let operationID: String
        let recordID: String
        let ownerID: String
        let action: Action
        let previousState: State
        let resultingState: State
        let revision: UInt64
    }

    struct Result: Equatable {
        let disposition: Disposition
        let state: State
        let revision: UInt64
        let event: AuditEvent?
    }

    struct Record: Equatable {
        let id: String
        let ownerID: String
        private(set) var state: State = .active
        private(set) var revision: UInt64 = 0
        private(set) var appliedOperationIDs: Set<String> = []
        private(set) var auditTrail: [AuditEvent] = []

        mutating func apply(
            _ action: Action,
            operationID: String,
            authenticatedOwnerID: String?
        ) -> Result {
            guard Self.hasValue(id), Self.hasValue(ownerID),
                  let authenticatedOwnerID,
                  Self.hasValue(authenticatedOwnerID),
                  authenticatedOwnerID == ownerID,
                  Self.hasValue(operationID) else {
                return Result(disposition: .rejected, state: state, revision: revision, event: nil)
            }

            guard !appliedOperationIDs.contains(operationID) else {
                return Result(disposition: .duplicateOperation, state: state, revision: revision, event: nil)
            }
            guard revision < UInt64.max,
                  let nextState = Self.transition(from: state, action: action) else {
                return Result(disposition: .rejected, state: state, revision: revision, event: nil)
            }

            let event = AuditEvent(
                operationID: operationID,
                recordID: id,
                ownerID: ownerID,
                action: action,
                previousState: state,
                resultingState: nextState,
                revision: revision + 1
            )
            state = nextState
            revision += 1
            appliedOperationIDs.insert(operationID)
            auditTrail.append(event)
            return Result(disposition: .applied, state: state, revision: revision, event: event)
        }

        private static func hasValue(_ value: String) -> Bool {
            !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }

        private static func transition(from state: State, action: Action) -> State? {
            switch (state, action) {
            case (.active, .archive): return .archived
            case (.archived, .unarchive): return .active
            case (.active, .moveToTrash), (.archived, .moveToTrash): return .trashed
            case (.trashed, .restore): return .active
            case (.trashed, .permanentlyDelete): return .deleted
            default: return nil
            }
        }
    }
}
