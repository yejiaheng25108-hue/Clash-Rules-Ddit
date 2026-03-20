# Clash Rules Ddit

![Clash Rules Ddit Cover](https://img.shields.io/badge/Clash--Rules--Editor-橘色主题-orange?style=for-the-badge) ![Pure-Frontend](https://img.shields.io/badge/100%25-Frontend--Only-brightgreen)

一个专为 Clash 用户设计的现代化、轻量级、纯前端的规则与策略组在线可视化编辑器。

🔗 **在线试用体验：**
- [主站节点试用: clash.skytailor.space](https://clash.skytailor.space/)
- [备用节点试用: clash-rules-ddit.pages.dev](https://clash-rules-ddit.pages.dev)

---

## 💡 项目简介 (Purpose)

**Clash Rules Ddit** 旨在解决由于节点众多、格式繁杂而导致的 Clash 订阅配置文件手动编辑极其困难的问题。本项目无需专业的代码知识，直接为您提供了一个直观、美观且单页面的图形界面（GUI），让您可以在一处轻松管理您的代理节点配置。

**核心功能特性包括：**
- **一站式单页工作流**：将配置导入、代理规则表（增删查改）、策略组梳理与设置等连贯排列，彻底摆脱频繁切换页面的烦心。
- **三种常用方式一键导入**：支持直接粘贴大段原生 YAML 文本、拉取远程的订阅链接更新，或直接拖拽本地的 `.yaml/.yml` 配置文件进行解析。
- **动态日志控制台追踪**：侧边控制台会实时记录每一个代理策略与规则节点的改动情况，让所有底层动作清晰可见。
- **精准的规则与策略组控制**：支持规则/策略组的独立多选、置顶固定（Pin）、一键撤回（Undo）与自定义组合批量删除，防误触设计让配置管理更加安心。
- **灵活的局部配置管理**：支持将选中的特定规则或策略组“打包”导出为独立的 `.yaml` 片段；也可将存放片段的本地文件拖拽导入，实时解析并插入到列表最上方。
- **现代化中文化 UI**：深度优化的亮色内容区与暗色侧边栏排版（主打质感橙色），同时进行了全面细致的汉化与界面精简，提升最终视觉操作体验。

---

## 🔒 隐私与安全性保障 (Security)

使用本项目处理您的核心敏感代理配置与订阅地址时，**您的数据绝对且 100% 得以保障**。

1. **纯粹的前端计算架构**：整个项目基于 React + Vite 构建，所有涉及配置文件的 YAML 解析逻辑、代理重组运算等底层动作，**均完全在您的本地设备（如浏览器内存区）中完成执行**。 
2. **零服务端存储与收集**：项目自身不含有任何后端截取服务代码，这意味着从您粘贴节点的这一刻起，**我们绝不会收集、劫持或外传您的任何一条规则配置、机场节点信息以及私人订阅链接。**
3. **开源透明接受审阅**：本项目为彻底开源托管项目，您可以随时对比并审阅全部源代码，以查验内部并没有任何跨平台的网络外传代码片段，安全私有！

---

## 🚀 部署指南: Cloudflare Pages 免费零成本部署

本项目经过完美的静态打磨，极为适合部署在各种高可用的免费静态托管服务上。这里推荐通过 **Cloudflare Pages** 来建设您的私有专属网站，3 分钟即可通过代码库自动完成部署。

### 步骤 1: Fork 开源代码库
将本项目此 GitHub 仓库 Fork 到您个人的 GitHub 帐号下（推荐设定为 Public 或 Private 库均可）。

### 步骤 2: 连接至 Cloudflare Dashboard
1. 登录您的 [Cloudflare 仪表板](https://dash.cloudflare.com/) 账户。
2. 在左侧的主菜单中找到并点击进入 **“Workers 和 Pages (Workers & Pages)”**。
3. 点击 **“创建应用程序 (Create application)”**，并选择顶部的 **“Pages”** 选项卡标签。
4. 点击 **“连接到 Git (Connect to Git)”**，授权 Cloudflare 读取您的 GitHub 内容，并选择您刚刚 Fork 生成的 `Clash-Rules-Ddit` 仓库。
5. 点击 **“开始设置 (Begin setup)”** 进入下一步配置。

### 步骤 3: 调整 Vite 构建设置 (Build Settings)
在项目的部署构建页面环节，请务必核对并按照如下参数进行填写：
- **框架预设 (Framework preset):** 选择 `None` 或者 `Vite`。
- **构建命令 (Build command):** 输入打包命令 `npm run build`
- **构建输出目录 (Build output directory):** 输入产物目录 `dist`

### 步骤 4: 保存并触发部署任务
点击页面的右下角 **“保存并部署 (Save and Deploy)”** 按钮。
Cloudflare 构建系统这将会自动化地为您分配构建环境、拉取最新源码、下载 npm 原材料并打包完毕向全球 CDN 节点进行静态内容分发。
短短几分钟后，它将会生成一个个人的可用链接（如 `your-project.pages.dev`）！一切就绪，您现在随时即可享受极速管理了。

---

## 🛠️ 本地开发运行试跑 (Local Development)

如果您想要在自己电脑上对源码进行深度的二创、开发或单纯地本地独立运行：

```bash
# 1. 克隆代码库到您的电脑中
git clone https://github.com/yejiaheng25108-hue/Clash-Rules-Ddit.git

# 2. 进入目录并安装必须的前台依赖（以 Node 运行环境为主）
cd Clash-Rules-Ddit
npm install

# 3. 启动开发服务器（含热更新支持功能）
npm run dev
```

执行完毕，按住 `Ctrl` 点击命令行抛出的链接（如默认提供的 `http://localhost:5173/`），即可在浏览器快速查看并修改！

---
*Developed with modern React, Vite, and tailwind*
