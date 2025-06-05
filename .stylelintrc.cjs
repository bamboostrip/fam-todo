// .stylelintrc.cjs

module.exports = {
  root: true,
  extends: [
    // stylelint-config-standard 替换成了更宽松的 stylelint-config-recommended
    'stylelint-config-recommended',
    // stylelint-config-standard-scss 替换成了更宽松的 stylelint-config-recommended-scss
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue/scss',
    'stylelint-config-html/vue',
    'stylelint-config-recess-order',
  ],
  plugins: ['stylelint-prettier'],
  overrides: [
    // 扫描 .vue/html 文件中的<style>标签内的样式
    {
      files: ['**/*.{vue,html}'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.{css,scss}'],
      customSyntax: 'postcss-scss',
    },
  ],
  // 自定义规则
  rules: {
    'prettier/prettier': true,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'export', 'v-deep', 'deep', 'theme'], // 'theme' 作为伪类被忽略似乎不寻常，确认是否需要
      },
    ],
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx'],
      },
    ],
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['page'],
      },
    ],
    // 为普通 CSS 文件配置（如果它们不通过 postcss-scss 解析的话，或者作为备用）
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'config',
          'theme', // <--- 针对 Tailwind v4 / Shadcn Vue v4
          'custom-variant', // <--- 针对 Tailwind v4 / Shadcn Vue v4
          // 如果还有其他自定义的 @ 规则，也加在这里
        ],
      },
    ],
    // **关键：为 SCSS 文件或通过 postcss-scss 解析的文件配置**
    'scss/at-rule-no-unknown': [
      // <--- 添加这个规则配置
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'config',
          'theme', // <--- 针对 Tailwind v4 / Shadcn Vue v4
          'custom-variant', // <--- 针对 Tailwind v4 / Shadcn Vue v4
          // 如果还有其他自定义的 @ 规则，也加在这里
        ],
      },
    ],
    'comment-empty-line-before': 'never',
    'custom-property-empty-line-before': 'never',
    'no-empty-source': null,
    'comment-no-empty': null,
    'no-duplicate-selectors': null,
    'scss/comment-no-empty': null, // 如果你希望允许空的 SCSS 注释
    'selector-class-pattern': null,
    'font-family-no-missing-generic-family-keyword': null,
  },
}
