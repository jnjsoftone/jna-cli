/// <reference types="node" />
/**
 * @module basic
 */
export type Dict = Record<string, any>;
/**
 * @module builtin
 */
export type FileOptions = {
    encoding?: BufferEncoding;
    overwrite?: boolean;
    newFile?: boolean;
};
export type JsonOptions = {
    indent?: number;
    overwrite?: boolean;
    newFile?: boolean;
};
/**
 * @module cli
 */
export type ExecResult = string;
export type ExecResults = string[];
export interface CliOptions {
    exec: string;
    requiredParameter?: string;
    optionalParameter?: string;
    saveOption?: string;
}
/**
 * @module git
 */
export type GithubAccount = {
    userName: string;
    fullName: string;
    email: string;
    token: string;
};
export type RepoOptions = {
    name: string;
    userName?: string;
    description?: string;
    auto_init?: boolean;
    isPrivate?: boolean;
    license_template?: string;
};
export type IssueListOptions = {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
    labels?: string[];
    assignee?: string;
    perPage?: number;
    page?: number;
};
export type IssueCreateOptions = {
    owner: string;
    repo: string;
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
    milestone?: number;
};
export type IssueUpdateOptions = {
    owner: string;
    repo: string;
    issueNumber: number;
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    labels?: string[];
    assignees?: string[];
    milestone?: number | null;
};
export type ProjectListOptions = {
    owner: string;
    repo: string;
    state?: 'open' | 'closed';
    perPage?: number;
};
export type ProjectCreateOptions = {
    owner: string;
    repo: string;
    name: string;
    body?: string;
};
export type ProjectColumnOptions = {
    projectId: number;
    name: string;
};
export type ProjectCardOptions = {
    columnId: number;
    note?: string;
    contentId?: number;
    contentType?: 'Issue' | 'PullRequest';
};
export type WorkflowDispatchOptions = {
    owner: string;
    repo: string;
    workflowId: number | string;
    ref: string;
    inputs?: Record<string, any>;
};
export type WorkflowListOptions = {
    owner: string;
    repo: string;
    perPage?: number;
    page?: number;
};
export type WorkflowRunsOptions = {
    owner: string;
    repo: string;
    workflowId?: number | string;
    branch?: string;
    status?: 'completed' | 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'success' | 'skipped' | 'stale' | 'in_progress' | 'queued' | 'requested' | 'waiting' | 'pending';
    perPage?: number;
    page?: number;
};
//# sourceMappingURL=types.d.ts.map