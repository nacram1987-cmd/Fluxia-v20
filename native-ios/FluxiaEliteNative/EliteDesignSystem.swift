import SwiftUI
import UIKit

/// Shared adaptive colors for the approved Fluxia Élite light and dark palettes.
/// Keep these tokens in presentation code; financial rules must not depend on them.
enum ElitePalette {
    private static func adaptive(light: UIColor, dark: UIColor) -> Color {
        Color(uiColor: UIColor { traits in
            traits.userInterfaceStyle == .dark ? dark : light
        })
    }

    static let navy = adaptive(
        light: UIColor(red: 0.97, green: 0.965, blue: 0.945, alpha: 1),
        dark: UIColor(red: 0.055, green: 0.11, blue: 0.18, alpha: 1)
    )
    static let ink = adaptive(
        light: UIColor(red: 0.09, green: 0.16, blue: 0.24, alpha: 1),
        dark: UIColor(red: 0.96, green: 0.96, blue: 0.94, alpha: 1)
    )
    static let gold = adaptive(
        light: UIColor(red: 0.57, green: 0.40, blue: 0.19, alpha: 1),
        dark: UIColor(red: 0.86, green: 0.71, blue: 0.45, alpha: 1)
    )
    static let champagne = adaptive(
        light: UIColor(red: 0.91, green: 0.83, blue: 0.66, alpha: 1),
        dark: UIColor(red: 0.70, green: 0.55, blue: 0.33, alpha: 1)
    )
    static let card = adaptive(
        light: UIColor(red: 1, green: 0.998, blue: 0.985, alpha: 1),
        dark: UIColor(red: 0.10, green: 0.17, blue: 0.25, alpha: 1)
    )
    static let availableEnd = adaptive(
        light: UIColor(red: 0.965, green: 0.935, blue: 0.87, alpha: 1),
        dark: UIColor(red: 0.16, green: 0.23, blue: 0.31, alpha: 1)
    )
}

/// Presentation-only destinations for the native tab bar.
enum EliteTab: String, CaseIterable, Identifiable {
    case home = "Inicio"
    case plan = "Plan"
    case banks = "Bancos"
    case settings = "Ajustes"

    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .home: "house.fill"
        case .plan: "square.grid.2x2.fill"
        case .banks: "building.columns.fill"
        case .settings: "gearshape.fill"
        }
    }
}
