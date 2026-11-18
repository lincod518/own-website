# lincod518 · 思考与实验

中文个人网站，分为写作与实验室。沿用现有 GitHub Pages 仓库和 `main` 根目录发布方式。

## 本地使用

需要 Node.js 18 或更高版本，无需安装依赖。

```sh
npm run build
npm run dev
```

预览地址：http://127.0.0.1:4173/own-website/

## 修改网站

- `src/site.mjs`：公共布局、导航、图标与实验卡片。
- `src/home.mjs`：首页的蓝色首屏、写作章节、实验预览、关于与 FAQ。
- `src/posts.mjs`：文章标题、摘要、日期和正文。文章内容为可信 HTML，不接收访客提交。
- `scripts/build.mjs`：首页和各页面模板；只写入明确的页面文件。
- `assets/site.css`：配色、响应式布局和动效。
- `assets/exhibit.css`、`assets/exhibit.mjs`：首页章节动效、动效暂停、键盘可操作的工具预览与阅读进度。
- `assets/visuals/hero-explorer-v2.webp`：内置 ImageGen 生成的原创主视觉，转码为透明 WebP 用于网页；原始 PNG 保留在本地同目录并由 Git 忽略，同目录 `.prompt.txt` 保留生成提示词。
- `assets/site.js`：导航、文章筛选、提示词与本地便签交互。
- `assets/tools-model.mjs`：提示词组合及便签备份校验。

修改模板或文章后运行 `npm run build`。生成的 HTML 需要一起提交；根目录的 `.nojekyll` 保证静态资源直接由 Pages 提供。所有站内链接使用相对地址，支持 `/own-website/` 项目路径。

## 验证

```sh
npm test
npm run check
```

便签只保存在访问者自己的浏览器，不上传，也不跨设备同步。导出 JSON 可备份，导入会保留原有记录；同一 ID 的冲突内容会作为另一条便签保留。目前的两个实验不调用 AI 模型。

以后接入需要密钥或持久数据库的 AI 项目时，可增加独立后端，并从实验室链接进入。
