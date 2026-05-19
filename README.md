# PF1e 法术查询器

Pathfinder 1e 法术查询和检索系统，支持中英文双语显示。

## 功能特点

- 📚 **3029个法术** - 完整的PF1e法术数据库
- 🔍 **智能搜索** - 支持中英文法术名称搜索
- 🎯 **多维度筛选** - 按职业、学派、法术等级筛选
- 🌐 **双语显示** - 中文翻译 + 英文原文对照
- 📱 **响应式设计** - 适配桌面和移动设备
- ⚡ **高性能** - SQLite数据库 + 前端缓存
- 🚀 **一键启动** - 自动安装依赖并启动服务

## 技术栈

- **后端**: Node.js + sql.js
- **前端**: 原生HTML/CSS/JavaScript
- **数据库**: SQLite (spells.db)
- **服务端**: 原生HTTP服务器

## 快速开始

### 系统要求

- Node.js 14+ ([下载地址](https://nodejs.org/))
- 现代浏览器 (Chrome/Firefox/Edge)
- 内存: 512MB+

### Windows 快速安装

#### 方法1：使用安装脚本（推荐）

1. 双击运行 `setup.bat` (快速安装)
2. 等待自动安装依赖
3. 选择是否立即启动服务器
4. 在浏览器中打开 http://localhost:8080

#### 方法2：手动安装

```bash
# 安装依赖
npm install

# 启动服务器
node server.js
```

### 启动服务器

**Windows:**
```bash
# 双击运行启动脚本
start.bat

# 或使用命令行
node server.js
```

**Linux/Mac:**
```bash
node server.js
```

服务器启动后访问: http://localhost:8080

## 项目结构

```
pfspell/
├── index.html              # 前端页面
├── server.js               # Node.js服务器
├── spells.db               # SQLite数据库 (8.8MB)
├── package.json            # 依赖配置
├── start.bat               # Windows启动脚本
├── setup.bat               # Windows安装脚本
├── README.md               # 项目文档
├── .gitignore              # Git忽略文件
├── node_modules/           # 依赖包
└── archive/                # 归档文件和脚本
```

## 数据库信息

- **法术总数**: 3029
- **职业数量**: 33 (包括变体职业)
- **学派数量**: 10
- **数据库大小**: 8.8MB

## 主要功能

### 筛选功能
- **职业筛选**: 33个PF1e职业及其变体
  - 包括：牧师、法师、术士、召唤师等
  - 支持变体职业如解放召唤师
- **学派筛选**: 防护、变化、咒法等10大学派
- **等级筛选**: 0-9环法术分类
- **文本搜索**: 实时搜索法术名称（支持中英文）

### 法术详情
- 中英文双语显示
- 职业等级信息
- 施法动作、射程、持续时间等详细数据
- 豁免、法术抗力等信息
- 英文原文对照按钮
- 链接到原始英文资料

## 界面特点

- **左侧筛选面板** - 支持多条件筛选，独立滚动
- **右侧法术列表** - 按等级分组显示
- **展开详情卡片** - 点击查看完整信息
- **原文对照按钮** - 一键切换英文原文
- **响应式设计** - 适配各种屏幕尺寸

## 开发说明

### 修改端口

服务器端口默认为 `8080`，可在 `server.js` 中修改：

```javascript
const PORT = 8080;
```

### 数据库结构

```sql
-- 主表
spells: id, name, translated_name, school_cn, school_en, types_cn, components_en...

-- 关联表
spell_classes: spell_id, class_name, class_name_cn, level
spell_actions: spell_id, name, activation_en, target_en, duration_en...
spell_domains: spell_id, type, name, level
```

### 重新生成数据库

如果需要从JSON重新生成数据库：

```bash
node scripts/migrate-english-primary.js
```

## 故障排除

### 端口被占用
- Windows启动脚本会自动处理端口冲突
- 或手动终止占用8080端口的进程

### 依赖安装失败
- 检查网络连接
- 尝试切换国内镜像源：`npm config set registry https://registry.npmmirror.com`

### 数据库文件缺失
- 确保从仓库完整下载项目
- 检查 `spells.db` 文件是否存在

## 贡献指南

欢迎提交问题和改进建议！

## Git仓库

- **GitHub**: https://github.com/jasonyzh/pathfinder1eSpell
- **克隆**: `git clone https://github.com/jasonyzh/pathfinder1eSpell.git`

## 数据来源

- 英文数据: pf1.spells.json
- 中文翻译: 社区翻译项目
- 最后更新: 2024年5月

## 许可证

本项目仅供学习和个人使用。

## 更新日志

### v1.0.0 (2024-05-19)
- 初始版本发布
- 支持3029个法术查询
- 中英文双语界面
- 完整的筛选和搜索功能
- 一键安装和启动脚本