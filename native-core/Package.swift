// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "FluxiaNativeCore",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "FluxiaNativeCore", targets: ["FluxiaNativeCore"])],
    targets: [
        .target(name: "FluxiaNativeCore", path: ".", exclude: ["Tests"], sources: [
            "FluxiaLedger.swift", "FluxiaCloudReader.swift", "FluxiaLegacyDocument.swift"
        ]),
        .testTarget(name: "FluxiaNativeCoreTests", dependencies: ["FluxiaNativeCore"],
                    path: "Tests")
    ]
)
