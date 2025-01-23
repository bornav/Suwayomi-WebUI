{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_22
    pkgs.yarn
    pkgs.nodePackages.pnpm
    pkgs.pnpm
    # Add other dependencies here, for example:
    # pkgs.git
    # pkgs.vim
  ];
}
