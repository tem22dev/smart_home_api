export default {
  // Extend the conventional commit rules from commitlint
  extends: ['@commitlint/config-conventional'],

  rules: {
    // Require a blank line between the header and body
    'body-leading-blank': [2, 'always'],

    // Warn if there is no blank line before the footer
    'footer-leading-blank': [1, 'always'],

    // Limit the header length to a maximum of 108 characters
    'header-max-length': [2, 'always', 108],

    // Disallow empty subject line
    'subject-empty': [2, 'never'],

    // Disallow empty type (e.g., feat, fix, chore, etc.)
    'type-empty': [2, 'never'],

    // Only allow commit types from the following list
    'type-enum': [
      2, // Error if not followed
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix
        'perf', // A performance improvement
        'style', // Changes that do not affect logic (e.g., formatting)
        'docs', // Documentation changes only
        'test', // Adding or updating tests
        'refactor', // Code refactoring without new features or bug fixes
        'build', // Changes related to the build system or dependencies
        'ci', // CI configuration changes (e.g., GitHub Actions)
        'chore', // Routine tasks or maintenance
        'revert', // Reverting a previous commit
        'wip', // Work in progress
        'workflow', // Workflow-related changes
        'types', // TypeScript type-related changes
        'release', // Release commit for new version
      ],
    ],
  },
};
