# Gazebo 远程控制 Web 程序

这是一个基于 Vue 3 + FastAPI + noVNC 的 Gazebo 远程控制系统，允许通过浏览器访问 Ubuntu 上的 Gazebo 仿真界面。

## 项目架构

```
浏览器 (Vue + noVNC)
    ↓ WebSocket (ws://localhost:8000/ws/vnc)
FastAPI 后端代理
    ↓ TCP (localhost:5900)
x11vnc VNC 服务器
    ↓
Gazebo (运行在 Xvfb 虚拟显示器)
```

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | Vue 3 + noVNC |
| 后端 | FastAPI |
| VNC 服务器 | x11vnc |
| 虚拟显示器 | Xvfb |
| 窗口管理器 | Fluxbox |

## 项目结构

```
noVNCdemo/
├── backend/              # FastAPI 后端
│   ├── main.py          # WebSocket 代理服务
│   └── requirements.txt # Python 依赖
├── frontend/            # Vue 3 前端
│   ├── src/
│   │   ├── App.vue      # 主应用组件
│   │   └── components/
│   │       └── VncViewer.vue  # noVNC 客户端组件
│   ├── dist/            # 构建输出目录
│   └── package.json     # 前端依赖
├── scripts/             # 启动脚本
│   └── start_services.sh # 启动 Xvfb + Gazebo + x11vnc
└── docs/                # 文档
    └── prompts/         # 项目说明

```

## 启动步骤

### 1. 启动 VNC 服务（Xvfb + Gazebo + x11vnc）

在终端 1 中运行：

```bash
cd /home/leju/zdc/noVNCdemo
chmod +x scripts/start_services.sh
./scripts/start_services.sh
```

这将启动：
- Xvfb 虚拟显示器（:1）
- Fluxbox 窗口管理器
- Gazebo 仿真器
- x11vnc VNC 服务器（端口 5900）

### 2. 启动 FastAPI 后端

在终端 2 中运行：

```bash
cd /home/leju/zdc/noVNCdemo/backend
source venv/bin/activate  # 激活虚拟环境
uvicorn main:app --host 0.0.0.0 --port 8000
```

后端会：
- 监听 http://localhost:8000
- 提供 WebSocket 代理服务（/ws/vnc）
- 在浏览器和 VNC 服务器之间转发数据

### 3. 启动前端开发服务器

在终端 3 中运行：

```bash
cd /home/leju/zdc/noVNCdemo/frontend
npm run serve
```

前端会：
- 启动开发服务器（通常是 http://localhost:8080）
- 自动连接到 FastAPI 后端的 WebSocket

### 4. 访问应用

打开浏览器访问：`http://localhost:8080`

你应该能看到 Gazebo 界面在浏览器中显示。

## 生产环境部署

### 构建前端

```bash
cd frontend
npm run build
```

构建后的文件在 `frontend/dist/` 目录，可以通过 Nginx 或其他 Web 服务器提供服务。

### 配置说明

- **VNC 密码**：在 `scripts/start_services.sh` 中设置（默认：123456）
  - 同时需要在 `frontend/src/components/VncViewer.vue` 中更新相同的密码
- **VNC 端口**：默认 5900
- **FastAPI 端口**：默认 8000
- **屏幕分辨率**：在 `start_services.sh` 中配置（默认：1280x720x24）

## 故障排除

### 前端无法连接

1. 检查 FastAPI 后端是否运行：`curl http://localhost:8000`
2. 检查 WebSocket 端点：浏览器控制台查看连接错误

### VNC 连接失败

1. 检查 x11vnc 是否运行：`ps aux | grep x11vnc`
2. 检查端口是否监听：`netstat -tuln | grep 5900`
3. 查看后端日志中的错误信息

### Gazebo 黑屏

1. 检查 Xvfb 是否运行：`ps aux | grep Xvfb`
2. 检查 Gazebo 进程：`ps aux | grep gazebo`
3. 验证 GLX 扩展：`DISPLAY=:1 glxinfo | grep OpenGL`

## 性能优化

- **延迟优化**：确保所有服务运行在同一台机器上
- **分辨率调整**：降低分辨率可以减少带宽和延迟
- **网络配置**：使用有线连接而非 WiFi

## 开发说明

### 修改前端

前端代码位于 `frontend/src/`，修改后会自动热重载（开发模式）。

### 修改后端

修改 `backend/main.py` 后需要重启 uvicorn 服务。

### 调试技巧

- 前端：浏览器开发者工具 → Network → WS（查看 WebSocket 通信）
- 后端：查看 uvicorn 输出的日志
- VNC：使用 VNC 客户端直接连接 `localhost:5900` 测试

## 许可证

本项目用于学习和研究目的。
