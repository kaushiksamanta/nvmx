class Nvmx < Formula
  desc "POSIX-compliant Node.js version manager written in TypeScript"
  homepage "https://github.com/kaushiksamanta/nvmx"
  url "https://github.com/kaushiksamanta/nvmx/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "REPLACE_WITH_ACTUAL_SHA256_AFTER_RELEASE"
  license "MIT"
  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
    
    # Install shell completion
    output = Utils.safe_popen_read("#{bin}/nvmx", "completion")
    (bash_completion/"nvmx").write output
    
    # Install shell integration script
    (prefix/"etc/nvmx.sh").write <<~EOS
      # nvmx shell integration
      export NVMX_HOME="$HOME/.nvmx"
      
      nvmx_use() {
        eval "$(nvmx use $@)"
      }
      
      nvmx_auto() {
        local version_file
        version_file=$(nvmx find-version-file)
        
        if [ -n "$version_file" ]; then
          local version
          version=$(cat "$version_file" | tr -d '[:space:]')
          nvmx_use "$version"
        fi
      }
      
      # Auto-use when changing directories
      if [ -n "$ZSH_VERSION" ]; then
        autoload -U add-zsh-hook
        add-zsh-hook chpwd nvmx_auto
      elif [ -n "$BASH_VERSION" ]; then
        cd() {
          builtin cd "$@" && nvmx_auto
        }
      fi
      
      # Initialize on shell startup
      nvmx_auto
    EOS
  end

  def caveats
    <<~EOS
      To enable nvmx shell integration, add the following to your ~/.zshrc or ~/.bashrc:
        source "#{etc}/nvmx.sh"
      
      This will allow you to use:
        nvmx_use <version>   # Switch to a specific Node.js version
        nvmx_auto            # Auto-switch based on .nvmxrc or .node-version files
    EOS
  end

  test do
    system bin/"nvmx", "--version"
    system bin/"nvmx", "list"
  end
end