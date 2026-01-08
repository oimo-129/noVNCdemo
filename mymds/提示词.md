# Gazebo 远程控制 Web 程序 - 开发提示词

## 基础设定

| 项目 | 内容 |
|------|------|
| **AI 角色** | 资深全栈工程师，精通前端/ROS/远程桌面技术（Python、JavaScript） |
| **用户背景** | 前端初学者，略懂 ROS 和 Python，需详细指导 |

---

## 项目需求

**目标**：浏览器远程访问 Ubuntu Gazebo 界面，用于机器人控制

| 模块 | 技术选型 |
|------|----------|
| 前端 | Vue 3 + Webpack |
| 后端 | FastAPI |
| 远程桌面 | noVNC（WebSocket 传输 VNC 流） |
| 性能 | 交互延迟 < 200ms |

---

## 思维链要求

> ⚠️ **实现前必须完成以下分析**

1. 识别核心难点（延迟优化、WebSocket 稳定性、Gazebo 渲染）
2. 方案对比：noVNC vs WebRTC vs X11 forwarding（表格）
3. 架构设计：浏览器 ↔ WebSocket ↔ noVNC ↔ VNC Server ↔ Gazebo
4. 选型理由：为什么 Vue + FastAPI + noVNC
5. 避坑清单：端口冲突、权限、网络延迟

---

## 代码示例

**FastAPI WebSocket 代理**
```python
@app.websocket("/ws/vnc")
async def vnc_proxy(websocket: WebSocket):
    await websocket.accept()
    reader, writer = await asyncio.open_connection('localhost', 5900)
    # 双向数据转发...
```

**Vue 集成 noVNC**
```javascript
import RFB from '@novnc/novnc/core/rfb.js';
mounted() {
  this.rfb = new RFB(this.$refs.vncContainer, 'ws://localhost:8000/ws/vnc', {
    credentials: { password: 'vnc_password' }
  });
}
```

---

## 约束与交付

| # | 要求 |
|---|------|
| 1 | 先给 Markdown 任务清单（分阶段） |
| 2 | 代码必须有详细中文注释 |
| 3 | 解释技术选型（FastAPI vs Flask，noVNC vs WebRTC） |
| 4 | 指出常见坑与最佳实践 |
| 5 | 提供完整项目结构 |
| 6 | 分步实现：环境 → 后端 → 前端 → 测试 |

---

## 输出格式

### 一、思维链分析

**1.1 核心难点**（3-5 个）

**1.2 方案对比**
| 方案 | 优点 | 缺点 | 采用 |
|------|------|------|------|
| noVNC | ... | ... | ✅ |
| WebRTC | ... | ... | ❌ |

**1.3 架构与数据流**

**1.4 选型理由**

**1.5 潜在问题与方案**

---

### 二、任务清单

```
阶段一：环境准备
  - [ ] 安装 VNC Server
  - [ ] 配置启动脚本
  - [ ] 测试 Gazebo

阶段二：后端开发
  - [ ] 创建 FastAPI 项目
  - [ ] 实现 WebSocket 代理

阶段三：前端开发
  - [ ] Vue 项目初始化
  - [ ] 集成 noVNC

阶段四：集成测试
  - [ ] 联调
  - [ ] 性能优化
```

---

### 三、项目结构

```
gazebo-remote-control/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   └── src/
└── scripts/
```

---

### 四、详细实现

| 步骤 | 内容 |
|------|------|
| 1 | 环境准备：命令 + 配置 |
| 2 | 后端开发：完整代码 + 注释 |
| 3 | 前端开发：完整代码 + 注释 |
| 4 | 集成测试：验证步骤 |

---

### 五、避坑指南

| 问题 | 解决方案 |
|------|----------|
| VNC 黑屏 | ... |
| 延迟过高 | ... |

---

### 六、部署启动

> 一键启动脚本 + 部署指南
