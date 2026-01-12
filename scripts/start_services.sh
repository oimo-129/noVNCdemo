#!/bin/bash

    # --- 配置 ---
    # 设置虚拟显示器的 DISPLAY ID，例如 :1
    export DISPLAY=:1
    # 设置屏幕分辨率，"1280x720x24"
    SCREEN_RESOLUTION="1280x720x24"
    # 设置 VNC 服务的端口
    VNC_PORT="5900"
    # 设置 VNC 访问密码（请修改为一个更安全的密码）
    VNC_PASSWORD="123456"

    # --- 清理旧进程 ---
    echo "==> 正在清理旧的 Xvfb, Gazebo, 和 x11vnc 进程..."
    # 使用 pkill 来确保所有相关进程都被终止
    pkill -f "Xvfb ${DISPLAY}"
    pkill -f "gzserver"
    pkill -f "gzclient"
    pkill -f "x11vnc -display ${DISPLAY}"
    # 等待一秒确保进程已退出
    sleep 1

    # --- 启动服务 ---
    echo "==> 正在启动 Xvfb (虚拟显示器) on ${DISPLAY} with resolution ${SCREEN_RESOLUTION}"
    # -screen 0: 创建一个屏幕，编号为0
    # ${SCREEN_RESOLUTION}: 设置分辨率和色深
    # +extension GLX: 启用 GLX 扩展，这对 Gazebo (OpenGL) 至关重要
    # & 符号: 在后台运行
    Xvfb ${DISPLAY} -screen 0 ${SCREEN_RESOLUTION} +extension GLX &
    # 保存 Xvfb 的进程 ID (PID)
    XVFB_PID=$!
    # 等待几秒钟，确保 Xvfb 完全启动
    sleep 2


    # --- 启动窗口管理器 ---
    echo "==> 正在启动 Fluxbox (窗口管理器)..."
    fluxbox &

    echo "==> 正在启动 Gazebo..."
    # 在 Xvfb 创建的虚拟显示器上启动 Gazebo
    # --verbose: 输出更多调试信息

    #这里定义，启动gazebo进程，不是其他程序！
    gazebo --verbose &
    GAZEBO_PID=$!
    # 等待 Gazebo 加载
    sleep 5

    echo "==> 正在启动 x11vnc (VNC Server) on port ${VNC_PORT}"
    # -display ${DISPLAY}: 指定要附加到的 X display
    # -passwd ${VNC_PASSWORD}: 设置 VNC 密码
    # -forever: 即使客户端断开连接，也保持运行
    # -shared: 允许多个客户端同时连接
    # -rfbport ${VNC_PORT}: 指定 VNC 监听的端口
    # -bg: 在后台运行
    #这边报错了，一直在连接，这里shell脚本逻辑可能后面再验证修改，去掉bg，让脚本阻塞前台
    x11vnc -display ${DISPLAY} -passwd ${VNC_PASSWORD} -forever -shared -rfbport ${VNC_PORT} 

    echo "==> 所有服务已启动！"
    echo "    - Xvfb PID: ${XVFB_PID}"
    echo "    - Gazebo PID: ${GAZEBO_PID}"
    echo "    - VNC Server 正在监听端口: ${VNC_PORT}"
    echo "    - 使用 VNC 客户端连接 localhost:${VNC_PORT} 进行测试。"
