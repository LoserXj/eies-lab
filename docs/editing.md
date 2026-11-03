# 在网页上编辑论文、报告、项目和团队信息

网站用 [Pages CMS](https://pagescms.org) 编辑。每次保存都会提交到 GitHub 仓库 `Chokurei/eies-lab-site` 的 `main` 分支，然后网站自动重新生成，一两分钟后上线。编辑表单由仓库根目录的 `.pages.yml` 定义。

## 一次性设置（管理员）

1. 用仓库所有者的 GitHub 账号登录 <https://app.pagescms.org>，按提示把 Pages CMS 的 GitHub App 安装到 `Chokurei/eies-lab-site`。
2. 在 Pages CMS 的项目设置里邀请成员：有 GitHub 账号的可以加为仓库协作者，没有的可以用邮箱邀请。
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
4. 把 `config/_default/hugo.yaml` 里的 `baseURL` 改成正式网址。

## 日常编辑

- 打开 <https://app.pagescms.org>，选择本仓库。左侧有五个栏目：
  - **Publications / 论文**
  - **Talks / 学术报告**
  - **Projects / 项目与成果**
  - **Team members / 团队**：个人资料
  - **团队（中文信息）**
- **网页上的编辑按钮：** 在网站任意页面的地址后加 `?edit=1`，这个浏览器以后就会在右下角显示“编辑此页”。点击后直接打开当前论文、报告、项目或成员的表单。地址后加 `?edit=0` 可以关闭按钮。访客看不到这个按钮。

### 新增论文

- **作者：** “Lab authors”只能选课题组成员，按作者顺序选。
- **其他字段：** DOI 填在 Identifiers 里，PDF、代码等链接加在 Links 里。
- **中文页：** 新论文只需要填英文。生成网站时，中文页会自动沿用英文内容。

### 新增成员

- **Slug：** 用小写的“姓-名”，例如 `chen-xiaoming`。创建后不要再改，论文是靠它关联到成员的。
- **照片：** 上传正方形照片即可。
- **中文信息：** 到“团队（中文信息）”里新建一条，Slug 和英文完全相同，只填需要中文显示的字段，留空的字段会沿用英文。

### 个人页的各个板块

个人页依次是：简介与数字栏、研究兴趣与教育背景、代表论文（最多 5 篇）、学术报告、项目与成果、技能与爱好、荣誉奖项。还没填的板块会显示“待补充”。数字栏里的“加入课题组”年份取自 Joined the lab 字段。

- **代表论文：** 来自论文栏目，作者里选了这位成员就会出现；勾选 Featured 的排在前面。
- **学术报告、项目与成果：** 来自“Talks / 学术报告”和“Projects / 项目与成果”栏目，选了这位成员的条目会自动出现，见下文。
- **其他板块：** 在“Team members / 团队”里编辑对应字段，包括 Education、Awards、Skills。
- **完整示例：** 参考董克川（`dong-kechuan`）的资料和他名下的报告、项目。

### 新增学术报告

每场报告是一个文件夹 `content/talks/<年份-名称>/index.md`。页面样式固定，只需要填内容，网址为 `/talks/<文件夹名>/`。

1. **新建：** 在“Talks / 学术报告”点 **Add an entry**。
2. **必填：** Title、Speakers（报告人，从成员里选，可多选）、Start（开始时间）、One-line summary（列表里显示的一句话）。
3. **选填：**
   - **报告信息：** End、Event、Event website、Format、Location、Abstract。
   - **Links：** 加演示文稿、视频、PDF、海报、活动页面。选了 slides，页面上会出现“点击上方演示文稿按钮查看报告内容”的提示。
   - **Figure：** 放报告第一页的截图，会配上图注。
   - **Cover image：** 有现场照片时用，会替代自动生成的封面。
4. **保存：** 一两分钟后，报告出现在每位报告人的个人页和 `/talks/` 列表里。尚未举行的报告也会显示。

### 新增项目与成果

每个项目是一个文件夹 `content/projects/<年份-名称>/index.md`。页面样式固定，网址为 `/projects/<文件夹名>/`。

1. **新建：** 在“Projects / 项目与成果”点 **Add an entry**。
2. **必填：** Title、Lab members、Date、One-line summary（卡片文字，也是页面第一段）。
3. **建议填：**
   - **Kind：** 模型、数据集、代码等。
   - **Cover image：** 16:9 图。
   - **Links：** 主页、论文、代码、数据。
4. **Page text 正文：** 已经预填了“Overview / Method / Data and code / Research uses”四个二级标题，用不到的删掉即可。每个二级标题都会出现在页面右侧的“本页目录”里。

### 图片和文件

- **封面和配图：** 在图片字段里直接上传，会存到 `assets/media/members/`，网站会自动压缩。16:9 横图效果最好，宽度 1600 像素左右即可。
- **演示文稿、PDF 等文件：** 在 Pages CMS 的 **Media → Talk and project files** 里上传，然后把 `/uploads/works/文件名` 填进 Links 的 URL。也可以直接填外部链接，比如 Google Drive 或 SlideShare。
- **正文里的图片：** 在正文编辑器里插入，也存到 `static/uploads/works/`。

### 中文页

- **默认：** 报告和项目只需要填英文，生成网站时中文页会自动沿用英文内容（和论文一样）。
- **单独写中文：** 在仓库里同一个文件夹加一个 `index.zh.md`，示例条目里都有。

### 谁可以编辑

- **权限：** Pages CMS 按仓库授权，被邀请的人能编辑所有栏目。请大家只改自己的资料、报告和项目。
- **查看改动：** 每次保存都是一次 GitHub 提交，提交者是保存的人。在仓库的提交记录里能看到谁改了什么，需要时可以撤回。
- **新成员：** 管理员先在“Team members / 团队”里建好资料，再到 Pages CMS 的项目设置里邀请此人。之后此人登录就能自己添加报告和项目。

### 页面样式（给维护网站的人）

| 内容 | 页面模板 | 新建模板 |
|---|---|---|
| 报告和项目详情页 | `layouts/works/single.html` + `layouts/_partials/member/work-article.html` | `archetypes/talks.md`、`archetypes/projects.md` |
| 报告和项目列表页 | `layouts/works/list.html` | — |
| 个人页里的报告、项目板块 | `layouts/_partials/hbx/blocks/member-works/block.html` | — |

命令行新建：

```bash
hugo new content talks/2026-short-name/index.md
```

## 注意

- 保存时如果提示有冲突，说明别人刚改过同一条，刷新后再改。
- 大量导入论文时，仍然可以用 BibTeX：更新仓库根目录的 `publications.bib`，自动化流程会生成论文页面。
