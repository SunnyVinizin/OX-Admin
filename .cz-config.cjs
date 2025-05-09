module.exports = {
  types: [
    {
      value: "feat",
      name: "✨ feat:     新功能",
      emoji: "✨"
    },
    {
      value: "fix",
      name: "🐛 fix:      修复bug",
      emoji: "🐛"
    },
    {
      value: "docs",
      name: "📝 docs:     文档更新",
      emoji: "📝"
    },
    {
      value: "style",
      name: "💄 style:    代码格式/样式更新",
      emoji: "💄"
    },
    {
      value: "refactor",
      name: "♻️  refactor: 代码重构",
      emoji: "♻️"
    },
    {
      value: "perf",
      name: "⚡️ perf:     性能优化",
      emoji: "⚡️"
    },
    {
      value: "test",
      name: "✅ test:     添加测试",
      emoji: "✅"
    },
    {
      value: "chore",
      name: "🔧 chore:    构建/工具/依赖更新",
      emoji: "🔧"
    }
  ],

  // 是否允许自定义范围
  allowCustomScopes: false,

  // 跳过问题
  skipQuestions: ["scope", "body", "breaking", "footer"],

  // 设置最大长度
  subjectLimit: 100,

  // 范围列表
  scopes: [
    {name: "components"},
    {name: "docs"},
    {name: "config"},
    {name: "other"}
  ],

  // 信息模板
  messages: {
    type: "选择你要提交的类型：",
    subject: "写一个简短的描述：\n"
  }
};
