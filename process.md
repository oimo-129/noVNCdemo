# 项目概况 / Project Process Log

## 1. 项目是什么？
Gazebo 远程控制 Web 系统。
- **核心目标**：让用户通过浏览器远程访问 Ubuntu 服务器上运行的 Gazebo 仿真界面。
- **关键组件**  
  | 层 | 技术 | 作用 |
  |----|------|------|
  | 桌面捕获 | `x11vnc` + `Xvfb` + `Fluxbox` | 在服务器上把 Gazebo 画面转换成 VNC 协议流 |
  | 传输代理 | `FastAPI` (Python) | 在浏览器 WebSocket 与 VNC TCP 之间做双向转发 |
  | Web 客户端 | `Vue 3` + `@novnc/novnc` | 在浏览器 Canvas 中渲染 VNC 数据 |

```
浏览器  ←WS→  FastAPI  ←TCP→  x11vnc  ←虚拟显示→  Gazebo
```

## 2. 已完成内容
1. **前端**：Vue3 + noVNC 客户端，具备连接/显示/断开等功能。
2. **后端**：FastAPI WebSocket 代理 `backend/main.py`
   - 环境变量外部化（`VNC_HOST`、`VNC_PORT`、`ALLOWED_ORIGINS`）。
   - `/health` 心跳接口。
3. **服务器脚本**：`scripts/start_services.sh` 启动 Xvfb、Gazebo、x11vnc。
4. **Supervisor**：已示范如何编写 `gazebo_vnc.conf` 将脚本托管。
5. **文档**：README、开发提示词、故障排除等。

## 3. 目前准备做什么？
### 新任务：跨平台移植
将 **FastAPI 后端** 与 **前端 Vue 项目** 移植到 Windows PC，使外部同事在本地也能：
- 运行代理 → 连接远程 Ubuntu 服务器 `x11vnc`
- 启动前端 → 浏览器里查看 Gazebo 画面

> 服务器端依旧只运行 Xvfb + Gazebo + x11vnc，不移动。

## 4. 待完成清单（高层级）
1. 编写 Windows 部署指南（见 `移植.md`）。
2. 验证在 Windows 10/11 上的 Python & Node 环境可用。
3. 提供一键脚本或批处理以简化启动。
4. 可选：Docker Desktop 方案 or WSL2 方案。