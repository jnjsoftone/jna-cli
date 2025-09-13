#!/bin/bash
# [syntax] ./publish.sh [patch|minor|major] [-m "commit message"] [--dry-run] [--skip-tests] [--force]
# default: patch, "chore: build for publish"

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
mode="patch"
commit_msg="chore: build for publish"
dry_run=false
skip_tests=false
force_publish=false

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
}

# Function to check if working directory is clean
check_working_directory() {
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Working directory has uncommitted changes"
        if [[ "$force_publish" == false ]]; then
            log_error "Please commit or stash changes before publishing (use --force to override)"
            exit 1
        fi
    fi
}

# Function to check if we're on main/master branch
check_main_branch() {
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
        log_warning "Publishing from branch '$current_branch' (not main/master)"
        if [[ "$force_publish" == false ]]; then
            read -p "Continue? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Publishing cancelled"
                exit 0
            fi
        fi
    fi
}

# Function to run tests
run_tests() {
    if [[ "$skip_tests" == false ]]; then
        log_info "Running tests..."
        if npm test; then
            log_success "Tests passed"
        else
            log_error "Tests failed"
            if [[ "$force_publish" == false ]]; then
                exit 1
            else
                log_warning "Continuing with failed tests (forced)"
            fi
        fi
    else
        log_warning "Skipping tests"
    fi
}

# Function to check npm registry authentication
check_npm_auth() {
    if ! npm whoami > /dev/null 2>&1; then
        log_error "Not logged in to npm. Run 'npm login' first"
        exit 1
    else
        log_info "Authenticated as: $(npm whoami)"
    fi
}

# Function to validate version
validate_version() {
    if [[ ! "$mode" =~ ^(patch|minor|major|prerelease|prepatch|preminor|premajor)$ ]]; then
        log_error "Invalid version type: $mode"
        log_info "Valid types: patch, minor, major, prerelease, prepatch, preminor, premajor"
        exit 1
    fi
}

# Function to show what would happen (dry run)
show_dry_run() {
    current_version=$(node -p "require('./package.json').version")
    log_info "DRY RUN - Would execute:"
    echo "  1. Pull latest changes from remote"
    echo "  2. Run tests (unless --skip-tests)"
    echo "  3. Build project"
    echo "  4. Commit changes with message: '$commit_msg'"
    echo "  5. Bump version from $current_version ($mode)"
    echo "  6. Push changes and tags"
    echo "  7. Publish to npm"
    echo ""
    log_info "To actually publish, run without --dry-run"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--message)
            commit_msg="$2"
            shift 2
            ;;
        --dry-run)
            dry_run=true
            shift
            ;;
        --skip-tests)
            skip_tests=true
            shift
            ;;
        --force)
            force_publish=true
            shift
            ;;
        patch|minor|major|prerelease|prepatch|preminor|premajor)
            mode="$1"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [VERSION_TYPE] [OPTIONS]"
            echo ""
            echo "VERSION_TYPE:"
            echo "  patch       Patch release (0.0.X) - default"
            echo "  minor       Minor release (0.X.0)"
            echo "  major       Major release (X.0.0)"
            echo "  prerelease  Pre-release (0.0.1-0)"
            echo "  prepatch    Pre-patch (0.0.1-0)"
            echo "  preminor    Pre-minor (0.1.0-0)"
            echo "  premajor    Pre-major (1.0.0-0)"
            echo ""
            echo "OPTIONS:"
            echo "  -m, --message MSG    Commit message (default: 'chore: build for publish')"
            echo "  --dry-run           Show what would be done without executing"
            echo "  --skip-tests        Skip running tests"
            echo "  --force             Force publish even with warnings"
            echo "  -h, --help          Show this help"
            exit 0
            ;;
        *)
            log_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Main execution
main() {
    log_info "Starting publish process..."
    log_info "Version type: $mode"
    log_info "Commit message: $commit_msg"
    
    # Validate inputs
    validate_version
    
    # Pre-flight checks
    check_git_repo
    check_npm_auth
    
    if [[ "$dry_run" == true ]]; then
        show_dry_run
        exit 0
    fi
    
    check_main_branch
    check_working_directory
    
    # Execute publish steps
    set -e  # Exit on any error
    
    log_info "Step 1/7: Pulling latest changes..."
    git pull || { log_error "Git pull failed"; exit 1; }
    
    log_info "Step 2/7: Running tests..."
    run_tests
    
    log_info "Step 3/7: Building project..."
    npm run build || { log_error "Build failed"; exit 1; }
    
    log_info "Step 4/7: Committing changes..."
    if [[ -n $(git status --porcelain) ]]; then
        git add .
        git commit -m "$commit_msg" || { log_error "Git commit failed"; exit 1; }
    else
        log_info "No changes to commit"
    fi
    
    log_info "Step 5/7: Bumping version..."
    npm version $mode || { log_error "Version bump failed"; exit 1; }
    new_version=$(node -p "require('./package.json').version")
    log_success "Version bumped to: $new_version"
    
    log_info "Step 6/7: Pushing to git..."
    git push --follow-tags || { log_error "Git push failed"; exit 1; }
    
    log_info "Step 7/7: Publishing to npm..."
    npm publish || { log_error "NPM publish failed"; exit 1; }
    
    log_success "Successfully published $new_version to npm! 🎉"
    log_info "Package URL: https://www.npmjs.com/package/$(node -p "require('./package.json').name")"
}

# Run main function
main