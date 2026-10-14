#if canImport(SwiftUI)
import SwiftUI

/// Honest loading state: shown while Supabase session is being verified and read.
struct FluxiaLoadingView: View {
    private let navy = Color(red: 0.08, green: 0.20, blue: 0.32)
    private let gold = Color(red: 0.75, green: 0.56, blue: 0.29)
    var body: some View {
        ZStack {
            navy.ignoresSafeArea()
            VStack(spacing: 17) {
                AsyncImage(url: URL(string: "https://nacram1987-cmd.github.io/Fluxia-v20/fluxia-icon.png")) { phase in
                    if let image = phase.image {
                        image.resizable().scaledToFit()
                    } else {
                        Image(systemName: "waveform.path")
                            .resizable().scaledToFit()
                            .foregroundStyle(gold)
                    }
                }
                .frame(width: 72, height: 72)
                Text("fluxia")
                    .font(.system(size: 37, weight: .semibold, design: .serif))
                    .foregroundStyle(.white)
                Text("ÉLITE BETA")
                    .font(.system(size: 12, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(gold)
                ProgressView("Comprobando sesión y datos reales…")
                    .tint(gold)
                    .foregroundStyle(.white)
                    .font(.caption)
                    .padding(.top, 22)
            }
        }
        .accessibilityElement(children: .combine)
    }
}
#endif
