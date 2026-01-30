{ pkgs }: {
  deps = [
    pkgs.unzip
    pkgs.nodejs_20
    pkgs.nodePackages.typescript-language-server
  ];
}
