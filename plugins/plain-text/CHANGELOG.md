# 更新日志

## v1.0.1

### 改进

- 合并编辑器重复渲染逻辑，提升可维护性
- 使用 useMemo 缓存行数计算，优化长文本性能
- 使用 useRef 替代 document.querySelector 同步行号滚动
- preload 文件写入操作增加 try-catch 错误处理

## v1.0.0

- 纯文本编辑器，即开即写
- Markdown 双模式，左右分栏实时预览
- 多文稿管理（新建、切换、删除）
- 自动保存至 localStorage
- 行号显示
- 字号切换（14 / 16 / 18 / 20px）
- 一键导出 .txt / .md 文件（Ctrl+S）
- 暗色模式适配
- Markdown 渲染 XSS 防护（DOMPurify）
