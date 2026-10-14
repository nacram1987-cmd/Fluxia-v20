import XCTest
@testable import FluxiaNativeCore

final class FluxiaLegacyDocumentTests: XCTestCase {
    func testUnknownLegacyKeysNeverAutoImport() {
        XCTAssertEqual(FluxiaLegacyDocument.classify("planRescate_v2_ingresos"), .excluded)
        XCTAssertEqual(FluxiaLegacyDocument.classify("p_profile__planRescate_v2_movimientos"), .excluded)
    }

    func testOnlyExplicitExactCanonicalKeyAccepted() {
        let keys = ["ingresos": "p_profile__planRescate_v2_ingresos"]
        XCTAssertEqual(FluxiaLegacyDocument.classify("p_profile__planRescate_v2_ingresos", canonicalKeys: keys), .candidate("ingresos"))
        XCTAssertEqual(FluxiaLegacyDocument.classify("planRescate_v2_ingresos", canonicalKeys: keys), .excluded)
    }

    func testHistoricalKeyRejectedEvenIfListedAsCanonical() {
        let key = "backup:planRescate_v2_ingresos"
        XCTAssertEqual(FluxiaLegacyDocument.classify(key, canonicalKeys: ["ingresos": key]), .historical)
    }
}
