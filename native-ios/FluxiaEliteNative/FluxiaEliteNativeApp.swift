import SwiftUI

@main
struct FluxiaEliteNativeApp: App {
    var body: some Scene {
        WindowGroup {
            NativeAccessRoot()
        }
    }
}

private struct NativeAccessRoot: View {
    @StateObject private var session = AuthSessionModel()
    @State private var isShowingDemo = ProcessInfo.processInfo.arguments.contains("-fluxia.demoMode")
    @AppStorage("fluxia.elite.darkMode") private var darkMode = false

    var body: some View {
        Group {
            if isShowingDemo {
                ContentView(onExitDemo: { isShowingDemo = false })
            } else {
                switch session.state {
                case .restoring:
                    ProgressView("Comprobando sesión segura…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(ElitePalette.navy)
                        .foregroundStyle(ElitePalette.ink)
                case .authenticated:
                    AuthenticatedSessionView(session: session)
                case .configurationMissing, .signedOut, .failed:
                    AuthGateView(session: session, showDemo: { isShowingDemo = true })
                }
            }
        }
        .task { session.start() }
        .preferredColorScheme(darkMode ? .dark : .light)
    }
}
