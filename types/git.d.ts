/** Github
 * References
 *   - [create repository](https://octokit.github.io/rest.js/v19#repos-create-for-authenticated-user)
 */
import { Octokit } from '@octokit/rest';
import type { GithubAccount, RepoOptions } from './types.js';
/**
 * Github 계정 정보 조회
 * @param userName - Github 사용자명
 * @returns Github 계정 정보
 *
 * @example
 * ```ts
 * const account = findGithubAccount('username');
 * ```
 */
declare const findGithubAccount: (userName: string, src?: string) => Promise<any>;
/**
 * 모든 저장소 목록 조회
 */
declare const findAllRepos: (octokit: Octokit) => Promise<{
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    license: {
        key: string;
        name: string;
        url: string | null;
        spdx_id: string | null;
        node_id: string;
        html_url?: string | undefined;
    } | null;
    forks: number;
    permissions?: {
        admin: boolean;
        pull: boolean;
        triage?: boolean | undefined;
        push: boolean;
        maintain?: boolean | undefined;
    } | undefined;
    owner: {
        name?: string | null | undefined;
        email?: string | null | undefined;
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string | undefined;
        user_view_type?: string | undefined;
    };
    private: boolean;
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    archive_url: string;
    assignees_url: string;
    blobs_url: string;
    branches_url: string;
    collaborators_url: string;
    comments_url: string;
    commits_url: string;
    compare_url: string;
    contents_url: string;
    contributors_url: string;
    deployments_url: string;
    downloads_url: string;
    events_url: string;
    forks_url: string;
    git_commits_url: string;
    git_refs_url: string;
    git_tags_url: string;
    git_url: string;
    issue_comment_url: string;
    issue_events_url: string;
    issues_url: string;
    keys_url: string;
    labels_url: string;
    languages_url: string;
    merges_url: string;
    milestones_url: string;
    notifications_url: string;
    pulls_url: string;
    releases_url: string;
    ssh_url: string;
    stargazers_url: string;
    statuses_url: string;
    subscribers_url: string;
    subscription_url: string;
    tags_url: string;
    teams_url: string;
    trees_url: string;
    clone_url: string;
    mirror_url: string | null;
    hooks_url: string;
    svn_url: string;
    homepage: string | null;
    language: string | null;
    forks_count: number;
    stargazers_count: number;
    watchers_count: number;
    size: number;
    default_branch: string;
    open_issues_count: number;
    is_template?: boolean | undefined;
    topics?: string[] | undefined;
    has_issues: boolean;
    has_projects: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_downloads: boolean;
    has_discussions?: boolean | undefined;
    archived: boolean;
    disabled: boolean;
    visibility?: string | undefined;
    pushed_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    allow_rebase_merge?: boolean | undefined;
    temp_clone_token?: string | undefined;
    allow_squash_merge?: boolean | undefined;
    allow_auto_merge?: boolean | undefined;
    delete_branch_on_merge?: boolean | undefined;
    allow_update_branch?: boolean | undefined;
    use_squash_pr_title_as_default?: boolean | undefined;
    squash_merge_commit_title?: "PR_TITLE" | "COMMIT_OR_PR_TITLE" | undefined;
    squash_merge_commit_message?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK" | undefined;
    merge_commit_title?: "PR_TITLE" | "MERGE_MESSAGE" | undefined;
    merge_commit_message?: "PR_TITLE" | "PR_BODY" | "BLANK" | undefined;
    allow_merge_commit?: boolean | undefined;
    allow_forking?: boolean | undefined;
    web_commit_signoff_required?: boolean | undefined;
    open_issues: number;
    watchers: number;
    master_branch?: string | undefined;
    starred_at?: string | undefined;
    anonymous_access_enabled?: boolean | undefined;
}[]>;
/**
 * 새 저장소 생성
 */
declare const createRemoteRepo: (octokit: Octokit, options: RepoOptions) => Promise<import("@octokit/types").OctokitResponse<{
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    owner: {
        name?: string | null | undefined;
        email?: string | null | undefined;
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string | undefined;
        user_view_type?: string | undefined;
    };
    private: boolean;
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    archive_url: string;
    assignees_url: string;
    blobs_url: string;
    branches_url: string;
    collaborators_url: string;
    comments_url: string;
    commits_url: string;
    compare_url: string;
    contents_url: string;
    contributors_url: string;
    deployments_url: string;
    downloads_url: string;
    events_url: string;
    forks_url: string;
    git_commits_url: string;
    git_refs_url: string;
    git_tags_url: string;
    git_url: string;
    issue_comment_url: string;
    issue_events_url: string;
    issues_url: string;
    keys_url: string;
    labels_url: string;
    languages_url: string;
    merges_url: string;
    milestones_url: string;
    notifications_url: string;
    pulls_url: string;
    releases_url: string;
    ssh_url: string;
    stargazers_url: string;
    statuses_url: string;
    subscribers_url: string;
    subscription_url: string;
    tags_url: string;
    teams_url: string;
    trees_url: string;
    clone_url: string;
    mirror_url: string | null;
    hooks_url: string;
    svn_url: string;
    homepage: string | null;
    language: string | null;
    forks_count: number;
    stargazers_count: number;
    watchers_count: number;
    size: number;
    default_branch: string;
    open_issues_count: number;
    is_template?: boolean | undefined;
    topics?: string[] | undefined;
    has_issues: boolean;
    has_projects: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_downloads?: boolean | undefined;
    has_discussions: boolean;
    archived: boolean;
    disabled: boolean;
    visibility?: string | undefined;
    pushed_at: string;
    created_at: string;
    updated_at: string;
    permissions?: {
        admin: boolean;
        maintain?: boolean | undefined;
        push: boolean;
        triage?: boolean | undefined;
        pull: boolean;
    } | undefined;
    allow_rebase_merge?: boolean | undefined;
    template_repository?: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        license: {
            key: string;
            name: string;
            url: string | null;
            spdx_id: string | null;
            node_id: string;
            html_url?: string | undefined;
        } | null;
        forks: number;
        permissions?: {
            admin: boolean;
            pull: boolean;
            triage?: boolean | undefined;
            push: boolean;
            maintain?: boolean | undefined;
        } | undefined;
        owner: {
            name?: string | null | undefined;
            email?: string | null | undefined;
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string | undefined;
            user_view_type?: string | undefined;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        url: string;
        archive_url: string;
        assignees_url: string;
        blobs_url: string;
        branches_url: string;
        collaborators_url: string;
        comments_url: string;
        commits_url: string;
        compare_url: string;
        contents_url: string;
        contributors_url: string;
        deployments_url: string;
        downloads_url: string;
        events_url: string;
        forks_url: string;
        git_commits_url: string;
        git_refs_url: string;
        git_tags_url: string;
        git_url: string;
        issue_comment_url: string;
        issue_events_url: string;
        issues_url: string;
        keys_url: string;
        labels_url: string;
        languages_url: string;
        merges_url: string;
        milestones_url: string;
        notifications_url: string;
        pulls_url: string;
        releases_url: string;
        ssh_url: string;
        stargazers_url: string;
        statuses_url: string;
        subscribers_url: string;
        subscription_url: string;
        tags_url: string;
        teams_url: string;
        trees_url: string;
        clone_url: string;
        mirror_url: string | null;
        hooks_url: string;
        svn_url: string;
        homepage: string | null;
        language: string | null;
        forks_count: number;
        stargazers_count: number;
        watchers_count: number;
        size: number;
        default_branch: string;
        open_issues_count: number;
        is_template?: boolean | undefined;
        topics?: string[] | undefined;
        has_issues: boolean;
        has_projects: boolean;
        has_wiki: boolean;
        has_pages: boolean;
        has_downloads: boolean;
        has_discussions?: boolean | undefined;
        archived: boolean;
        disabled: boolean;
        visibility?: string | undefined;
        pushed_at: string | null;
        created_at: string | null;
        updated_at: string | null;
        allow_rebase_merge?: boolean | undefined;
        temp_clone_token?: string | undefined;
        allow_squash_merge?: boolean | undefined;
        allow_auto_merge?: boolean | undefined;
        delete_branch_on_merge?: boolean | undefined;
        allow_update_branch?: boolean | undefined;
        use_squash_pr_title_as_default?: boolean | undefined;
        squash_merge_commit_title?: "PR_TITLE" | "COMMIT_OR_PR_TITLE" | undefined;
        squash_merge_commit_message?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK" | undefined;
        merge_commit_title?: "PR_TITLE" | "MERGE_MESSAGE" | undefined;
        merge_commit_message?: "PR_TITLE" | "PR_BODY" | "BLANK" | undefined;
        allow_merge_commit?: boolean | undefined;
        allow_forking?: boolean | undefined;
        web_commit_signoff_required?: boolean | undefined;
        open_issues: number;
        watchers: number;
        master_branch?: string | undefined;
        starred_at?: string | undefined;
        anonymous_access_enabled?: boolean | undefined;
    } | null | undefined;
    temp_clone_token?: string | null | undefined;
    allow_squash_merge?: boolean | undefined;
    allow_auto_merge?: boolean | undefined;
    delete_branch_on_merge?: boolean | undefined;
    allow_merge_commit?: boolean | undefined;
    allow_update_branch?: boolean | undefined;
    use_squash_pr_title_as_default?: boolean | undefined;
    squash_merge_commit_title?: "PR_TITLE" | "COMMIT_OR_PR_TITLE" | undefined;
    squash_merge_commit_message?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK" | undefined;
    merge_commit_title?: "PR_TITLE" | "MERGE_MESSAGE" | undefined;
    merge_commit_message?: "PR_TITLE" | "PR_BODY" | "BLANK" | undefined;
    allow_forking?: boolean | undefined;
    web_commit_signoff_required?: boolean | undefined;
    subscribers_count: number;
    network_count: number;
    license: {
        key: string;
        name: string;
        url: string | null;
        spdx_id: string | null;
        node_id: string;
        html_url?: string | undefined;
    } | null;
    organization?: {
        name?: string | null | undefined;
        email?: string | null | undefined;
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string | undefined;
        user_view_type?: string | undefined;
    } | null | undefined;
    parent?: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        license: {
            key: string;
            name: string;
            url: string | null;
            spdx_id: string | null;
            node_id: string;
            html_url?: string | undefined;
        } | null;
        forks: number;
        permissions?: {
            admin: boolean;
            pull: boolean;
            triage?: boolean | undefined;
            push: boolean;
            maintain?: boolean | undefined;
        } | undefined;
        owner: {
            name?: string | null | undefined;
            email?: string | null | undefined;
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string | undefined;
            user_view_type?: string | undefined;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        url: string;
        archive_url: string;
        assignees_url: string;
        blobs_url: string;
        branches_url: string;
        collaborators_url: string;
        comments_url: string;
        commits_url: string;
        compare_url: string;
        contents_url: string;
        contributors_url: string;
        deployments_url: string;
        downloads_url: string;
        events_url: string;
        forks_url: string;
        git_commits_url: string;
        git_refs_url: string;
        git_tags_url: string;
        git_url: string;
        issue_comment_url: string;
        issue_events_url: string;
        issues_url: string;
        keys_url: string;
        labels_url: string;
        languages_url: string;
        merges_url: string;
        milestones_url: string;
        notifications_url: string;
        pulls_url: string;
        releases_url: string;
        ssh_url: string;
        stargazers_url: string;
        statuses_url: string;
        subscribers_url: string;
        subscription_url: string;
        tags_url: string;
        teams_url: string;
        trees_url: string;
        clone_url: string;
        mirror_url: string | null;
        hooks_url: string;
        svn_url: string;
        homepage: string | null;
        language: string | null;
        forks_count: number;
        stargazers_count: number;
        watchers_count: number;
        size: number;
        default_branch: string;
        open_issues_count: number;
        is_template?: boolean | undefined;
        topics?: string[] | undefined;
        has_issues: boolean;
        has_projects: boolean;
        has_wiki: boolean;
        has_pages: boolean;
        has_downloads: boolean;
        has_discussions?: boolean | undefined;
        archived: boolean;
        disabled: boolean;
        visibility?: string | undefined;
        pushed_at: string | null;
        created_at: string | null;
        updated_at: string | null;
        allow_rebase_merge?: boolean | undefined;
        temp_clone_token?: string | undefined;
        allow_squash_merge?: boolean | undefined;
        allow_auto_merge?: boolean | undefined;
        delete_branch_on_merge?: boolean | undefined;
        allow_update_branch?: boolean | undefined;
        use_squash_pr_title_as_default?: boolean | undefined;
        squash_merge_commit_title?: "PR_TITLE" | "COMMIT_OR_PR_TITLE" | undefined;
        squash_merge_commit_message?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK" | undefined;
        merge_commit_title?: "PR_TITLE" | "MERGE_MESSAGE" | undefined;
        merge_commit_message?: "PR_TITLE" | "PR_BODY" | "BLANK" | undefined;
        allow_merge_commit?: boolean | undefined;
        allow_forking?: boolean | undefined;
        web_commit_signoff_required?: boolean | undefined;
        open_issues: number;
        watchers: number;
        master_branch?: string | undefined;
        starred_at?: string | undefined;
        anonymous_access_enabled?: boolean | undefined;
    } | undefined;
    source?: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        license: {
            key: string;
            name: string;
            url: string | null;
            spdx_id: string | null;
            node_id: string;
            html_url?: string | undefined;
        } | null;
        forks: number;
        permissions?: {
            admin: boolean;
            pull: boolean;
            triage?: boolean | undefined;
            push: boolean;
            maintain?: boolean | undefined;
        } | undefined;
        owner: {
            name?: string | null | undefined;
            email?: string | null | undefined;
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string | undefined;
            user_view_type?: string | undefined;
        };
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        url: string;
        archive_url: string;
        assignees_url: string;
        blobs_url: string;
        branches_url: string;
        collaborators_url: string;
        comments_url: string;
        commits_url: string;
        compare_url: string;
        contents_url: string;
        contributors_url: string;
        deployments_url: string;
        downloads_url: string;
        events_url: string;
        forks_url: string;
        git_commits_url: string;
        git_refs_url: string;
        git_tags_url: string;
        git_url: string;
        issue_comment_url: string;
        issue_events_url: string;
        issues_url: string;
        keys_url: string;
        labels_url: string;
        languages_url: string;
        merges_url: string;
        milestones_url: string;
        notifications_url: string;
        pulls_url: string;
        releases_url: string;
        ssh_url: string;
        stargazers_url: string;
        statuses_url: string;
        subscribers_url: string;
        subscription_url: string;
        tags_url: string;
        teams_url: string;
        trees_url: string;
        clone_url: string;
        mirror_url: string | null;
        hooks_url: string;
        svn_url: string;
        homepage: string | null;
        language: string | null;
        forks_count: number;
        stargazers_count: number;
        watchers_count: number;
        size: number;
        default_branch: string;
        open_issues_count: number;
        is_template?: boolean | undefined;
        topics?: string[] | undefined;
        has_issues: boolean;
        has_projects: boolean;
        has_wiki: boolean;
        has_pages: boolean;
        has_downloads: boolean;
        has_discussions?: boolean | undefined;
        archived: boolean;
        disabled: boolean;
        visibility?: string | undefined;
        pushed_at: string | null;
        created_at: string | null;
        updated_at: string | null;
        allow_rebase_merge?: boolean | undefined;
        temp_clone_token?: string | undefined;
        allow_squash_merge?: boolean | undefined;
        allow_auto_merge?: boolean | undefined;
        delete_branch_on_merge?: boolean | undefined;
        allow_update_branch?: boolean | undefined;
        use_squash_pr_title_as_default?: boolean | undefined;
        squash_merge_commit_title?: "PR_TITLE" | "COMMIT_OR_PR_TITLE" | undefined;
        squash_merge_commit_message?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK" | undefined;
        merge_commit_title?: "PR_TITLE" | "MERGE_MESSAGE" | undefined;
        merge_commit_message?: "PR_TITLE" | "PR_BODY" | "BLANK" | undefined;
        allow_merge_commit?: boolean | undefined;
        allow_forking?: boolean | undefined;
        web_commit_signoff_required?: boolean | undefined;
        open_issues: number;
        watchers: number;
        master_branch?: string | undefined;
        starred_at?: string | undefined;
        anonymous_access_enabled?: boolean | undefined;
    } | undefined;
    forks: number;
    master_branch?: string | undefined;
    open_issues: number;
    watchers: number;
    anonymous_access_enabled?: boolean | undefined;
    code_of_conduct?: {
        url: string;
        key: string;
        name: string;
        html_url: string | null;
    } | undefined;
    security_and_analysis?: {
        advanced_security?: {
            status?: "enabled" | "disabled" | undefined;
        } | undefined;
        dependabot_security_updates?: {
            status?: "enabled" | "disabled" | undefined;
        } | undefined;
        secret_scanning?: {
            status?: "enabled" | "disabled" | undefined;
        } | undefined;
        secret_scanning_push_protection?: {
            status?: "enabled" | "disabled" | undefined;
        } | undefined;
        secret_scanning_non_provider_patterns?: {
            status?: "enabled" | "disabled" | undefined;
        } | undefined;
        secret_scanning_ai_detection?: {
            status?: "enabled" | "disabled" | undefined;
        } | undefined;
    } | null | undefined;
    custom_properties?: {
        [key: string]: unknown;
    } | undefined;
}, 201>>;
/**
 * 저장소 삭제
 */
declare const deleteRemoteRepo: (octokit: Octokit, options: RepoOptions, account: GithubAccount) => Promise<import("@octokit/types").OctokitResponse<never, 204>>;
/**
 * Git 설정 변경
 */
declare const setLocalConfig: (options: RepoOptions, account: GithubAccount, localPath: string) => void;
/**
 * 로컬 저장소 초기화
 */
declare const initLocalRepo: (options: RepoOptions, account: GithubAccount, localPath: string) => Promise<void>;
/**
 * 저장소 복제
 */
declare const cloneRepo: (options: RepoOptions, account: GithubAccount, localPath: string) => void;
/**
 * 저장소 초기화 (생성, 복제, 설정)
 */
declare const initRepo: (octokit: Octokit, options: RepoOptions, account: GithubAccount, localPath: string) => void;
/**
 * 저장소 복제 및 설정
 */
declare const copyRepo: (options: RepoOptions, account: GithubAccount, localPath: string) => void;
/**
 * 저장소에 변경사항 푸시
 */
declare const pushRepo: (options: RepoOptions, account: GithubAccount, localPath: string) => void;
/**
 * 새 저장소 생성 및 초기 커밋
 */
declare const makeRepo: (octokit: Octokit, options: RepoOptions, account: GithubAccount, localPath: string) => void;
/**
 * 로컬 + 원격 저장소 삭제
 */
declare const removeRepo: (octokit: Octokit, options: RepoOptions, account: GithubAccount, localPath: string) => void;
export { findGithubAccount, findAllRepos, createRemoteRepo, deleteRemoteRepo, cloneRepo, setLocalConfig, initLocalRepo, initRepo, copyRepo, pushRepo, makeRepo, removeRepo, };
//# sourceMappingURL=git.d.ts.map