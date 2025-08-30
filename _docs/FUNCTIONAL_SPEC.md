# Functional Specification
## JNA-CLI: GitHub Repository Management CLI Tool

### 📋 Document Information
- **Document Type**: Functional Specification
- **Version**: 1.0
- **Last Updated**: 2025-08-30
- **Target Audience**: Developers, QA Engineers, Product Managers

---

## 1. Overview & Scope

### 1.1 Product Purpose
JNA-CLI is a command-line interface tool designed to streamline GitHub repository management and project initialization workflows. It provides automated solutions for common development tasks including repository creation, project setup, and git operations.

### 1.2 Key Features
- GitHub repository CRUD operations
- Automated project initialization with templates
- Git configuration and authentication management
- Cross-platform compatibility (Windows, macOS, Linux)
- Custom commit message handling

### 1.3 Target Users
- Software developers managing multiple repositories
- DevOps engineers automating project setup
- Team leads standardizing development workflows
- Students learning git and repository management

---

## 2. Functional Requirements

### 2.1 Command Interface Specifications

#### 2.1.1 XGIT Command Structure
```
xgit -e <operation> -u <username> -n <repository> [options]
```

**Required Parameters**:
- `-e, --exec`: Operation type (string, required)
- `-u, --userName`: GitHub username (string, optional with default)
- `-n, --repoName`: Repository name (string, required for most operations)

**Optional Parameters**:
- `-d, --description`: Repository description or commit message (string)
- `-p, --isPrivate`: Private repository flag (boolean, default: false)
- `-s, --src`: Source location for templates (string, default: 'local')

#### 2.1.2 Supported Operations

| Operation | Command | Function | Input Requirements |
|-----------|---------|----------|-------------------|
| List Repositories | `list`, `listRepos` | Display all user repositories | username |
| Create Repository | `create`, `createRemoteRepo` | Create remote GitHub repository | username, repo name, description |
| Initialize Repository | `init`, `initRepo` | Create remote + local setup | username, repo name, description |
| Clone Repository | `clone`, `cloneRepo` | Clone existing repository | username, repo name |
| Copy Repository | `copy`, `copyRepo` | Clone + configure repository | username, repo name |
| Push Changes | `push`, `pushRepo` | Push local changes with commit | username, repo name, commit message |
| Make Repository | `make`, `makeRepo` | Complete repository workflow | username, repo name, description |
| Delete Repository | `del`, `deleteRemoteRepo` | Remove remote repository | username, repo name |
| Remove Repository | `remove`, `removeRepo` | Remove remote + local repository | username, repo name |

### 2.2 Core Functional Modules

#### 2.2.1 Authentication Module (`git.ts`)

**Function**: `findGithubAccount(userName: string, src?: string)`
- **Purpose**: Retrieve GitHub account credentials
- **Input**: Username string, source ('local' or 'github')
- **Output**: GithubAccount object or undefined
- **Behavior**: 
  - Searches local environment variables first
  - Falls back to remote configuration files
  - Returns account with token, email, and metadata
- **Error Handling**: Returns undefined on failure, logs error messages

**Function**: `setLocalConfig(options, account, localPath)`
- **Purpose**: Configure local git repository settings
- **Input**: Repository options, account credentials, local path
- **Output**: Void (side effect: git configuration)
- **Behavior**:
  - Sets git user.name and user.email
  - Configures remote origin URL with authentication
  - Updates local repository configuration

#### 2.2.2 Repository Management Module

**Function**: `createRemoteRepo(octokit, options)`
- **Purpose**: Create new GitHub repository
- **Input**: Octokit client, repository options
- **Output**: Promise<Repository> response from GitHub API
- **Behavior**:
  - Creates repository with specified name and description
  - Sets visibility (public/private) based on options
  - Initializes with README.md automatically
- **Error Handling**: Throws on API errors, duplicate names, insufficient permissions

**Function**: `pushRepo(options, account, localPath)`
- **Purpose**: Push local changes to remote repository
- **Input**: Repository options, account credentials, local path
- **Output**: Void (side effect: git push)
- **Behavior**:
  - Checks for uncommitted changes using `git status --porcelain`
  - Creates commit with custom message from options.description
  - Falls back to "Initial commit" if no description provided
  - Pushes to main or master branch automatically
- **Error Handling**: Logs execution errors, continues with warnings

**Function**: `initLocalRepo(options, account, localPath)`
- **Purpose**: Initialize local git repository
- **Input**: Repository options, account credentials, local path
- **Output**: Void (side effect: git initialization)
- **Behavior**:
  - Sets directory permissions (Unix systems)
  - Initializes git repository
  - Renames master branch to main
  - Configures user credentials
  - Adds remote origin
  - Creates initial commit with custom message
- **Error Handling**: Continues on branch rename failures, logs errors

#### 2.2.3 Project Initialization Module (`cli.ts`)

**Function**: `initTsApp(options, platform, src)`
- **Purpose**: Initialize TypeScript project from template
- **Input**: Project options, target platform, source location
- **Output**: Promise<options> (project configuration)
- **Behavior**:
  - Downloads template from GitHub or copies from local
  - Substitutes template variables (name, author, description)
  - Installs NPM dependencies
  - Creates repository using xgit makeRepo command
- **Error Handling**: Throws on template download failures, continues on substitution errors

### 2.3 Data Flow Specifications

#### 2.3.1 Repository Creation Workflow
```
User Input → Command Parser → GitHub Authentication → Repository Creation → Local Setup → Initial Commit → Push
```

**Detailed Steps**:
1. Parse command line arguments using yargs
2. Validate required parameters (username, repository name)
3. Retrieve GitHub account credentials from environment/config
4. Create Octokit client with authentication token
5. Call GitHub API to create remote repository
6. Initialize local git repository in target directory
7. Configure git user credentials and remote origin
8. Create initial commit with user-provided message
9. Push initial commit to remote repository

#### 2.3.2 File Template Processing Workflow
```
Template Source → Download/Copy → Variable Substitution → Package Installation → Repository Creation
```

**Detailed Steps**:
1. Determine template source (GitHub repository or local directory)
2. Copy template files to target project directory
3. Identify template files requiring variable substitution
4. Replace placeholders with actual values ({{name}}, {{author}}, etc.)
5. Install project dependencies using NPM
6. Create corresponding GitHub repository
7. Initialize git and push template as initial commit

### 2.4 Error Handling Specifications

#### 2.4.1 Authentication Errors
- **GitHub Token Invalid**: Display clear message, suggest token regeneration
- **Insufficient Permissions**: List required token scopes, provide setup instructions
- **Network Connectivity**: Retry with exponential backoff, suggest offline alternatives

#### 2.4.2 Repository Errors
- **Duplicate Repository Name**: Suggest alternative names, offer deletion option
- **Repository Not Found**: Verify repository name and ownership
- **Local Directory Conflicts**: Prompt for directory cleanup or alternative location

#### 2.4.3 Template Errors
- **Template Not Found**: List available templates, suggest custom template setup
- **Substitution Failures**: Continue with warnings, log failed substitutions
- **Dependency Installation Failures**: Display NPM error output, suggest manual installation

---

## 3. Non-Functional Requirements

### 3.1 Performance Specifications
- **Command Response Time**: <5 seconds for simple operations
- **Repository Creation**: <30 seconds including initial setup
- **Template Processing**: <2 minutes for large templates with dependencies
- **Memory Usage**: <500MB during peak operations

### 3.2 Reliability Specifications
- **Operation Success Rate**: 95% for standard GitHub operations
- **Error Recovery**: Graceful handling of network interruptions
- **Data Consistency**: Atomic operations where possible
- **Idempotency**: Safe to retry most operations

### 3.3 Security Specifications
- **Credential Management**: No hardcoded tokens, environment variable storage
- **Token Scope Validation**: Verify minimum required permissions
- **Input Sanitization**: Validate all user inputs to prevent injection attacks
- **Logging Security**: Never log sensitive credentials or tokens

---

## 4. User Interface Specifications

### 4.1 Command Line Interface
- **Help System**: `--help` flag provides comprehensive usage information
- **Error Messages**: Clear, actionable error descriptions with suggested solutions
- **Progress Indicators**: Visual feedback for long-running operations
- **Consistent Syntax**: Uniform parameter naming across all commands

### 4.2 Output Formatting
- **Success Messages**: Confirmation of completed operations with relevant details
- **Error Format**: Structured error output with error type and resolution steps
- **Verbose Mode**: Optional detailed logging for troubleshooting
- **JSON Output**: Machine-readable output format for automation

---

## 5. Integration Specifications

### 5.1 External Service Dependencies
- **GitHub API**: REST API v3 for repository operations
- **Git CLI**: System git installation for local repository management
- **NPM Registry**: Package installation and dependency management
- **Template Repository**: GitHub repository for project templates

### 5.2 Internal Library Dependencies
- **jnu-abc**: Utility functions for file operations and data manipulation
- **jnu-cloud**: Cloud service integrations for GitHub operations
- **@octokit/rest**: Official GitHub API client library
- **yargs**: Command-line argument parsing and validation

---

## 6. Testing Specifications

### 6.1 Unit Test Requirements
- **Function Coverage**: 90% minimum code coverage for core functions
- **Error Path Testing**: Comprehensive testing of error conditions
- **Mock Dependencies**: Mock external services for reliable testing
- **Platform Testing**: Verify functionality across Windows, macOS, Linux

### 6.2 Integration Test Requirements
- **GitHub API Integration**: Test against live GitHub API with test repositories
- **Template Processing**: Verify complete template-to-project workflows
- **Cross-Platform Compatibility**: Automated testing on multiple operating systems
- **End-to-End Workflows**: Complete user journey testing from command to result

### 6.3 User Acceptance Testing
- **Common Workflows**: Test typical user scenarios and edge cases
- **Error Recovery**: Verify graceful handling of failure scenarios
- **Performance Benchmarks**: Measure and validate performance requirements
- **Documentation Accuracy**: Ensure documentation matches actual behavior

---

## 7. Future Enhancements

### 7.1 Planned Features (Next Release)
- **Batch Operations**: Process multiple repositories in single command
- **Template Customization**: User-defined template variables and processing
- **Configuration Profiles**: Multiple GitHub account support
- **Interactive Mode**: Guided repository setup with prompts

### 7.2 Long-term Roadmap
- **Web Interface**: Browser-based repository management dashboard
- **CI/CD Integration**: Direct integration with popular CI/CD platforms
- **Team Collaboration**: Shared templates and standardized workflows
- **Analytics**: Usage tracking and repository management insights

---

*Document Version: 1.0*  
*Last Updated: 2025-08-30*  
*Next Review: 2025-09-30*