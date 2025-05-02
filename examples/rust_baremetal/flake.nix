{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      flake = { };
      systems = [ "x86_64-linux" ];
      perSystem =
        { pkgs, system, ... }:
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [ (import inputs.rust-overlay) ];
          };

          devShells.default = pkgs.mkShell {
            packages =
              with pkgs;
              let
                rust_opts = {
                  extensions = [
                    "rust-src"
                    "llvm-tools"
                  ];
                  targets = [ "x86_64-unknown-none" ];
                };
              in
              [
                (rust-bin.selectLatestNightlyWith (toolchain: toolchain.default.override rust_opts))
              ];
          };
        };
    };
}
