#if canImport(SwiftUI)
import SwiftUI

/// iOS app entry point. Authentication wiring is pending: no fake user is injected.
@main
struct FluxiaEliteApp: App {
    var body: some Scene {
        WindowGroup {
            FluxiaEliteAppView()
        }
    }
}
#endif
