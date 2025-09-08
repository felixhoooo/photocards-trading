{ pkgs, ... }: {
	# Which nixpkgs channel to use.
	channel = "unstable"; # Or "stable-23.11"
	# Use https://search.nixos.org/packages to find packages
	packages = [
		pkgs.nodejs_22
		pkgs.xorg.libX11
		pkgs.xorg.libXcomposite
        pkgs.xorg.libXcursor
        pkgs.xorg.libXdamage
        pkgs.xorg.libXfixes
        pkgs.xorg.libXi
        pkgs.xorg.libXrandr
        pkgs.xorg.libXScrnSaver
        pkgs.alsa-lib
        pkgs.nss
        pkgs.cups
        pkgs.expat
        pkgs.gcc.cc.lib
        pkgs.gdk-pixbuf
        pkgs.glib
        pkgs.gtk3
        pkgs.pango
        pkgs.cairo
        pkgs.atk
        pkgs.chromium
	];
	# Sets environment variables in the workspace
	env = {};
	idx = {
		# Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
		extensions = [
			"vscodevim.vim"
		];
		workspace = {
			# Runs when a workspace is first created
			onCreate = {
				# Example: install dependencies and build a project
				npm-install = "npm install";
			};
		};
		# Enable previews and customize configuration
		previews = {
			enable = true;
			previews = {
				web = {
					command = [
						"npm"
						"run"
						"dev"
						"--"
						"--port"
						"$PORT"
						"--host"
						"0.0.0.0"
					];
					manager = "web";
				};
			};
		};
	};
}
