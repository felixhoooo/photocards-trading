{ pkgs, ... }: {
	# Which nixpkgs channel to use.
	channel = "unstable"; # Or "stable-23.11"
	# Use https://search.nixos.org/packages to find packages
	packages = [
		pkgs.nodejs_22
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
