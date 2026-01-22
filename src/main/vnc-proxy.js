// VNC 代理服务器，实现 WebSocket 到 VNC 协议的转发，替代原方案的fastapi+uvicorn
import { WebSocketServer } from 'ws'
import net from 'net'

let wss = null

//改成 VNC 服务器 地址和端口
export function startVncProxy(port = 8000, vncHost = 'localhost', vncPort = 5900) {
  if (wss) {
    console.log('VNC 代理已在运行')
    return
  }

  wss = new WebSocketServer({ port })
  console.log(`VNC WebSocket 代理启动在端口 ${port}`)

  wss.on('connection', (ws, req) => {
    console.log('新的 VNC 客户端连接')

    // 连接到 VNC 服务器
    const vncSocket = net.connect(vncPort, vncHost, () => {
      console.log(`已连接到 VNC 服务器 ${vncHost}:${vncPort}`)
    })

    // VNC -> 客户端
    vncSocket.on('data', (data) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data)
      }
    })

    // 客户端 -> VNC
    ws.on('message', (data) => {
      vncSocket.write(data)
    })

    // 错误处理
    vncSocket.on('error', (err) => {
      console.error('VNC 连接错误:', err.message)
      ws.close()
    })

    ws.on('error', (err) => {
      console.error('WebSocket 错误:', err.message)
      vncSocket.destroy()
    })

    // 关闭处理
    vncSocket.on('close', () => {
      console.log('VNC 连接关闭')
      ws.close()
    })

    ws.on('close', () => {
      console.log('客户端断开连接')
      vncSocket.destroy()
    })
  })
}

export function stopVncProxy() {
  if (wss) {
    wss.close()
    wss = null
    console.log('VNC 代理已停止')
  }
}