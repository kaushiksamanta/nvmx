/**
 * Shell completion scripts for nvmx
 */

/**
 * Generate Bash completion script
 */
export function generateBashCompletion(): string {
  return `
# nvmx bash completion script
_nvmx_completions() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  
  # Main commands
  if [[ \${COMP_CWORD} -eq 1 ]]; then
    opts="install use list ls ls-remote current uninstall remove config shell alias cache"
    COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
    return 0
  fi

  # Subcommands
  case "\${prev}" in
    "alias")
      opts="list ls set rm remove"
      COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
      return 0
      ;;
    "config")
      opts="get set"
      COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
      return 0
      ;;
    "cache")
      opts="set-ttl clear-remote"
      COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
      return 0
      ;;
    "get")
      opts="mirror proxy default"
      COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
      return 0
      ;;
    "set")
      opts="mirror proxy default"
      COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
      return 0
      ;;
    "use"|"uninstall"|"remove")
      # Complete with installed versions and aliases
      local versions=$(nvmx list | grep -v "No versions" | sed 's/^[* ] //')
      local aliases=$(nvmx alias list | grep -v "No aliases" | sed 's/^  \\(.*\\) -> .*/\\1/')
      opts="\${versions} \${aliases}"
      COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
      return 0
      ;;
    "install")
      # Complete with remote versions
      if [[ -z "\${cur}" ]]; then
        # If empty, suggest lts
        COMPREPLY=( $(compgen -W "lts" -- \${cur}) )
      else
        # Otherwise, try to complete with remote versions
        local versions=$(nvmx ls-remote | grep -v "Fetching" | grep -v "Available" | grep -v "and" | sed 's/^  //')
        COMPREPLY=( $(compgen -W "\${versions}" -- \${cur}) )
      fi
      return 0
      ;;
  esac

  return 0
}

complete -F _nvmx_completions nvmx
`
}

/**
 * Generate Zsh completion script
 */
export function generateZshCompletion(): string {
  return `
#compdef nvmx

_nvmx() {
  local -a commands
  local -a subcommands
  local -a versions
  local -a aliases

  commands=(
    'install:Install a specific Node.js version'
    'use:Use a specific Node.js version'
    'list:List installed Node.js versions'
    'ls:List installed Node.js versions'
    'ls-remote:List available Node.js versions from the remote server'
    'current:Show the currently active Node.js version'
    'uninstall:Uninstall a specific Node.js version'
    'remove:Uninstall a specific Node.js version'
    'config:Manage nvmx configuration'
    'shell:Output shell integration code'
    'alias:Manage Node.js version aliases'
    'cache:Manage nvmx cache'
  )

  _arguments -C \\
    '1: :->command' \\
    '*: :->args' && ret=0

  case $state in
    command)
      _describe -t commands 'nvmx commands' commands && ret=0
      ;;
    args)
      case $words[2] in
        alias)
          subcommands=(
            'list:List all aliases'
            'ls:List all aliases'
            'set:Set an alias for a Node.js version'
            'rm:Remove an alias'
            'remove:Remove an alias'
          )
          _arguments -C \\
            '1: :->subcommand' \\
            '*: :->subargs' && ret=0

          case $state in
            subcommand)
              _describe -t subcommands 'alias subcommands' subcommands && ret=0
              ;;
            subargs)
              case $words[3] in
                set)
                  if [[ $CURRENT -eq 4 ]]; then
                    # Alias name
                    _message 'alias name'
                  elif [[ $CURRENT -eq 5 ]]; then
                    # Version
                    versions=(\$(nvmx list | grep -v "No versions" | sed 's/^[* ] //'))
                    _describe -t versions 'Node.js versions' versions && ret=0
                  fi
                  ;;
                rm|remove)
                  aliases=(\$(nvmx alias list | grep -v "No aliases" | sed 's/^  \\(.*\\) -> .*/\\1/'))
                  _describe -t aliases 'aliases' aliases && ret=0
                  ;;
              esac
              ;;
          esac
          ;;
        config)
          subcommands=(
            'get:Get a configuration value'
            'set:Set a configuration value'
          )
          _arguments -C \\
            '1: :->subcommand' \\
            '*: :->subargs' && ret=0

          case $state in
            subcommand)
              _describe -t subcommands 'config subcommands' subcommands && ret=0
              ;;
            subargs)
              case $words[3] in
                get|set)
                  local -a keys
                  keys=(
                    'mirror:URL for Node.js distribution mirror'
                    'proxy:Proxy URL for downloads'
                    'default:Default Node.js version to use'
                  )
                  _describe -t keys 'configuration keys' keys && ret=0
                  ;;
              esac
              ;;
          esac
          ;;
        cache)
          subcommands=(
            'set-ttl:Set the time-to-live for remote versions cache in minutes'
            'clear-remote:Clear the remote versions cache'
          )
          _describe -t subcommands 'cache subcommands' subcommands && ret=0
          ;;
        use|uninstall|remove)
          # Complete with installed versions and aliases
          versions=(\$(nvmx list | grep -v "No versions" | sed 's/^[* ] //'))
          aliases=(\$(nvmx alias list | grep -v "No aliases" | sed 's/^  \\(.*\\) -> .*/\\1/'))
          _alternative \\
            'versions:installed versions:compadd -a versions' \\
            'aliases:aliases:compadd -a aliases' && ret=0
          ;;
        install)
          if [[ -z $words[3] ]]; then
            _values 'version' 'lts' && ret=0
          else
            versions=(\$(nvmx ls-remote | grep -v "Fetching" | grep -v "Available" | grep -v "and" | sed 's/^  //'))
            _describe -t versions 'Node.js versions' versions && ret=0
          fi
          ;;
      esac
      ;;
  esac

  return ret
}

_nvmx
`
}

/**
 * Generate Fish completion script
 */
export function generateFishCompletion(): string {
  return `
# nvmx fish completion

function __nvmx_needs_command
  set cmd (commandline -opc)
  if [ (count $cmd) -eq 1 ]
    return 0
  end
  return 1
end

function __nvmx_using_command
  set cmd (commandline -opc)
  if [ (count $cmd) -gt 1 ]
    if [ $argv[1] = $cmd[2] ]
      return 0
    end
  end
  return 1
end

function __nvmx_using_subcommand
  set cmd (commandline -opc)
  if [ (count $cmd) -gt 2 ]
    if [ $argv[1] = $cmd[2] -a $argv[2] = $cmd[3] ]
      return 0
    end
  end
  return 1
end

# Main commands
complete -f -c nvmx -n '__nvmx_needs_command' -a install -d 'Install a specific Node.js version'
complete -f -c nvmx -n '__nvmx_needs_command' -a use -d 'Use a specific Node.js version'
complete -f -c nvmx -n '__nvmx_needs_command' -a list -d 'List installed Node.js versions'
complete -f -c nvmx -n '__nvmx_needs_command' -a ls -d 'List installed Node.js versions'
complete -f -c nvmx -n '__nvmx_needs_command' -a ls-remote -d 'List available Node.js versions from the remote server'
complete -f -c nvmx -n '__nvmx_needs_command' -a current -d 'Show the currently active Node.js version'
complete -f -c nvmx -n '__nvmx_needs_command' -a uninstall -d 'Uninstall a specific Node.js version'
complete -f -c nvmx -n '__nvmx_needs_command' -a remove -d 'Uninstall a specific Node.js version'
complete -f -c nvmx -n '__nvmx_needs_command' -a config -d 'Manage nvmx configuration'
complete -f -c nvmx -n '__nvmx_needs_command' -a shell -d 'Output shell integration code'
complete -f -c nvmx -n '__nvmx_needs_command' -a alias -d 'Manage Node.js version aliases'
complete -f -c nvmx -n '__nvmx_needs_command' -a cache -d 'Manage nvmx cache'

# Alias subcommands
complete -f -c nvmx -n '__nvmx_using_command alias' -a list -d 'List all aliases'
complete -f -c nvmx -n '__nvmx_using_command alias' -a ls -d 'List all aliases'
complete -f -c nvmx -n '__nvmx_using_command alias' -a set -d 'Set an alias for a Node.js version'
complete -f -c nvmx -n '__nvmx_using_command alias' -a rm -d 'Remove an alias'
complete -f -c nvmx -n '__nvmx_using_command alias' -a remove -d 'Remove an alias'

# Config subcommands
complete -f -c nvmx -n '__nvmx_using_command config' -a get -d 'Get a configuration value'
complete -f -c nvmx -n '__nvmx_using_command config' -a set -d 'Set a configuration value'

# Cache subcommands
complete -f -c nvmx -n '__nvmx_using_command cache' -a set-ttl -d 'Set the time-to-live for remote versions cache in minutes'
complete -f -c nvmx -n '__nvmx_using_command cache' -a clear-remote -d 'Clear the remote versions cache'

# Config keys
complete -f -c nvmx -n '__nvmx_using_subcommand config get' -a 'mirror proxy default' -d 'Configuration key'
complete -f -c nvmx -n '__nvmx_using_subcommand config set' -a 'mirror proxy default' -d 'Configuration key'

# Version completions for use/uninstall/remove
complete -f -c nvmx -n '__nvmx_using_command use' -a "(nvmx list | grep -v 'No versions' | sed 's/^[* ] //')" -d 'Installed version'
complete -f -c nvmx -n '__nvmx_using_command uninstall' -a "(nvmx list | grep -v 'No versions' | sed 's/^[* ] //')" -d 'Installed version'
complete -f -c nvmx -n '__nvmx_using_command remove' -a "(nvmx list | grep -v 'No versions' | sed 's/^[* ] //')" -d 'Installed version'

# Alias completions for alias rm/remove
complete -f -c nvmx -n '__nvmx_using_subcommand alias rm' -a "(nvmx alias list | grep -v 'No aliases' | sed 's/^  \\(.*\\) -> .*/\\1/')" -d 'Alias'
complete -f -c nvmx -n '__nvmx_using_subcommand alias remove' -a "(nvmx alias list | grep -v 'No aliases' | sed 's/^  \\(.*\\) -> .*/\\1/')" -d 'Alias'

# Install completions
complete -f -c nvmx -n '__nvmx_using_command install' -a "lts" -d 'Latest LTS version'
`
}
