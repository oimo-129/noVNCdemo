# backend/main.py

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

# --- 配置 ---
# 日志配置
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# VNC 服务器的地址和端口
VNC_SERVER_HOST = "localhost"
VNC_SERVER_PORT = 5900

# --- FastAPI 应用实例 ---
app = FastAPI()

# --- 中间件配置 ---
# 配置 CORS (跨源资源共享)，允许所有来源的请求。
# 在生产环境中，你应该将其限制为你的前端域名。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)

# --- WebSocket 代理核心逻辑 ---

async def forward_to_vnc(client_ws: WebSocket, vnc_writer: asyncio.StreamWriter):
    """
    任务：从客户端 WebSocket 读取数据，并转发到 VNC 服务器。
    """
    try:
        while True:
            # 等待从客户端（浏览器 noVNC）接收数据
            data = await client_ws.receive_bytes()
            # 将数据写入到 VNC 服务器的 TCP 连接
            vnc_writer.write(data)
            await vnc_writer.drain()
    except WebSocketDisconnect:
        logging.info("客户端 WebSocket 连接断开。")
    except Exception as e:
        logging.error(f"转发到 VNC 时发生错误: {e}")
    finally:
        logging.info("停止从客户端到 VNC 的转发。")


async def forward_to_client(client_ws: WebSocket, vnc_reader: asyncio.StreamReader):
    """
    任务：从 VNC 服务器读取数据，并转发到客户端 WebSocket。
    """
    try:
        while True:
            # 从 VNC 服务器的 TCP 连接读取数据，每次最多读取 65536 字节
            data = await vnc_reader.read(65536)
            if not data:
                logging.warning("VNC 服务器连接已关闭，没有数据可读。")
                await client_ws.close()
                break
            # 将数据发送到客户端（浏览器 noVNC）
            await client_ws.send_bytes(data)
    except Exception as e:
        logging.error(f"转发到客户端时发生错误: {e}")
    finally:
        logging.info("停止从 VNC 到客户端的转发。")


@app.websocket("/ws/vnc")
async def websocket_vnc_proxy(websocket: WebSocket):
    """
    主 WebSocket 端点，处理来自 noVNC 的连接请求。
    """
    await websocket.accept()
    logging.info("接受来自客户端的 WebSocket 连接。")

    vnc_reader, vnc_writer = None, None
    try:
        # 建立到本地 VNC 服务器的 TCP 连接
        logging.info(f"正在连接到 VNC 服务器 at {VNC_SERVER_HOST}:{VNC_SERVER_PORT}...")
        vnc_reader, vnc_writer = await asyncio.open_connection(
            VNC_SERVER_HOST, VNC_SERVER_PORT
        )
        logging.info("成功连接到 VNC 服务器。")

        # 创建两个并发任务，用于双向数据转发
        task_to_vnc = asyncio.create_task(forward_to_vnc(websocket, vnc_writer))
        task_to_client = asyncio.create_task(forward_to_client(websocket, vnc_reader))

        # 等待任一任务完成（通常是因为连接断开）
        await asyncio.gather(task_to_vnc, task_to_client)

    except ConnectionRefusedError:
        logging.error("连接 VNC 服务器被拒绝。请确保 VNC 服务正在运行。")
        await websocket.close(code=1011)
    except Exception as e:
        logging.error(f"WebSocket 代理发生未知错误: {e}")
    finally:
        logging.info("代理会话结束，正在关闭连接。")
        if vnc_writer:
            vnc_writer.close()
            await vnc_writer.wait_closed()
        if not websocket.client_state == "DISCONNECTED":
            await websocket.close()


@app.get("/")
def read_root():
    return {"message": "Gazebo VNC 代理服务器正在运行。请通过 WebSocket 连接 /ws/vnc"}
