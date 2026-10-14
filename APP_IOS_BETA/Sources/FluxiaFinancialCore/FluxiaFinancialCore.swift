import Foundation

/// Shared deterministic accounting core for the future SwiftUI client.
/// All financial values are integer euro cents; no floating point is used.
public enum FluxiaMovementRole: String, Sendable {
    case variableReal = "variable-real"
    case fixedLinked = "fixed-linked"
    case cash
    case transfer
    case excluded
    case unknown
}

public struct FluxiaAvailableInput: Sendable, Equatable {
    public let incomeCents: Int64
    public let realExpensesCents: Int64
    public let plannedProvisionsCents: Int64
    public let excessContributionsCents: Int64

    public init(incomeCents: Int64, realExpensesCents: Int64, plannedProvisionsCents: Int64, excessContributionsCents: Int64) {
        self.incomeCents = incomeCents
        self.realExpensesCents = realExpensesCents
        self.plannedProvisionsCents = plannedProvisionsCents
        self.excessContributionsCents = excessContributionsCents
    }
}

public struct FluxiaAvailableBreakdown: Sendable, Equatable {
    public let input: FluxiaAvailableInput
    public let availableCents: Int64

    public init(input: FluxiaAvailableInput) {
        self.input = input
        self.availableCents = input.incomeCents
            - input.realExpensesCents
            - input.plannedProvisionsCents
            - input.excessContributionsCents
    }
}

public struct FluxiaHuchaUse: Sendable, Equatable {
    public let amountCents: Int64
    public let temporary: Bool
    public let repaidCents: Int64

    public init(amountCents: Int64, temporary: Bool, repaidCents: Int64 = 0) {
        self.amountCents = amountCents
        self.temporary = temporary
        self.repaidCents = repaidCents
    }
}

public struct FluxiaHuchaLedger: Sendable, Equatable {
    public let contributionsCents: Int64
    public let temporaryCents: Int64
    public let definitiveCents: Int64
    public let repaidCents: Int64
    public let outstandingCents: Int64
    public let availableCents: Int64

    public init(contributionsCents: Int64, uses: [FluxiaHuchaUse]) throws {
        guard contributionsCents >= 0 else { throw FluxiaFinancialError.negativeAmount }
        var temporary: Int64 = 0
        var definitive: Int64 = 0
        var repaid: Int64 = 0
        var outstanding: Int64 = 0
        for use in uses {
            guard use.amountCents >= 0, use.repaidCents >= 0, use.repaidCents <= use.amountCents else {
                throw FluxiaFinancialError.invalidReimbursement
            }
            if use.temporary {
                temporary += use.amountCents
                repaid += use.repaidCents
                outstanding += use.amountCents - use.repaidCents
            } else {
                definitive += use.amountCents
            }
        }
        self.contributionsCents = contributionsCents
        self.temporaryCents = temporary
        self.definitiveCents = definitive
        self.repaidCents = repaid
        self.outstandingCents = outstanding
        self.availableCents = contributionsCents - temporary - definitive + repaid
    }
}

public enum FluxiaFinancialError: Error, Equatable {
    case negativeAmount
    case invalidReimbursement
}

public enum FluxiaFinancialCore {
    public static let version = "1.0.0"

    public static func available(_ input: FluxiaAvailableInput) -> FluxiaAvailableBreakdown {
        FluxiaAvailableBreakdown(input: input)
    }
}
