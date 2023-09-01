English (US) | [简体中文](CONTRIBUTING.zh-Hans.md)

# Contributing

## collaboration

### Submit Information

We use
[Angular's Commit Specification](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commit-message-format).

The format of the title is `type: subject`:

- `type` a label indicating what kind of commit this is (what changes are involved)
- A one-sentence description of the `subject` submission
  - Use English imperative sentences (what this commit will do); lowercase initials; do not use periods
- (We don't use `scope` for now)

Commonly used `type`:

- `fix` This is a commit that fixes a bug
- `feat` This is a commit that adds a new feature
- `refactor` This is a commit that refactors an existing feature
- `docs` This commit updates the docs (README/comments/…)
- `ci` commits changes to CI (changed ESLint rules/updated testing tools/updated GitHub
  Actions...)
- `chore` Other changes that do not meet the above description (such as regular dependency updates)

**If you find that your commit satisfies multiple tags at the same time, your commit needs to be split into multiple. **

Example:

```
feat: add ahooks
ci: update tooling config
refactor: remove useless ide-scql
docs: make issues/PR templates bilingual
```

### source branch

Branch naming follows a similar convention to commit messages. The format is `type/subject`, where `subject` uses
`kebab-case` (all lower case, use - as hyphen), **branch name does not need to add your name. **
