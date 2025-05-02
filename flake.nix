{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devshell.url = "github:numtide/devshell";
  };

  outputs =
    inputs@{ flake-parts, devshell, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ devshell.flakeModule ];
      systems = [ "x86_64-linux" ];

      perSystem =
        { pkgs, ... }:
        {
          devshells.default = {
            packages = with pkgs; [
              hugo
              nodejs
              pnpm_10
              act
              google-lighthouse
              pagefind
            ];

            commands = [
              {
                name = "prod";
                help = "Create a local HTTP server to test and validate production environment";
                category = "testing";
                command = ''
                  set -e

                  hugo build --minify --environment production --cleanDestinationDir --gc
                  pagefind --serve
                '';
              }
              {
                name = "dev";
                help = "Start local development server";
                command = "hugo server --gc --noHTTPCache --buildDrafts --openBrowser --cleanDestinationDir";
              }
              {
                name = "benchmark";
                help = "Start a local production server & runs Google Lighthouse against it";
                category = "testing";
                command = ''
                  set -e

                  serve-production & 
                  CHROME_PATH="${pkgs.chromium}/bin/chromium" lighthouse --output-path lighthouse-report.html --view --quiet http://localhost:1414
                  ${pkgs.killall}/bin/killall pagefind
                '';
              }
              {
                name = "deploy";
                help = "Build & deploy to Cloudflare Pages";
                category = "ci/cd";
                command = "act push";
              }
            ];
          };
        };
    };
}
