import {getToken} from "@/utils/auth";
import {ElMessage} from "element-plus";
import {emitter} from "@/utils/mitt";

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectCount = 0;
  private readonly maxReconnectCount = 3;
  private readonly reconnectDelay = 3000;
  private timer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private forceClose = false;
  private isReconnecting = false;

  private constructor() {
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isReconnecting) return;

    try {
      const token = getToken();
      if (!token?.accessToken) {
        console.warn("WebSocket: 未找到认证token");
        return;
      }

      this.forceClose = false;
      const wsURL = `${location.protocol === "https:" ? "wss:" : "ws:"}//${
        import.meta.env.VITE_WS_URL
      }/api/v1/ws?token=${encodeURIComponent(token.accessToken)}`;

      this.ws = new WebSocket(wsURL);
      this.initEventHandlers();
    } catch (error) {
      console.error("WebSocket: 创建连接失败", error);
    }
  }

  private initEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.reconnectCount = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      // 发送连接成功事件
      emitter.emit("wsConnected", true);
    };

    this.ws.onmessage = event => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "pong") return;

        // 使用专门的消息事件类型
        emitter.emit("wsMessage", message);
      } catch {}
    };

    this.ws.onclose = event => {
      this.handleClose(event);
      emitter.emit("wsConnected", false);
    };

    this.ws.onerror = () => {
      console.error("WebSocket: 连接错误");
      emitter.emit("wsError", "WebSocket连接错误");
      this.reconnect();
    };
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();

    if (event.wasClean) {
      console.log(`WebSocket: 连接已关闭，代码: ${event.code}`);
    } else {
      this.reconnect();
    }
  }

  private reconnect(): void {
    if (this.forceClose || this.isReconnecting) return;

    if (this.reconnectCount >= this.maxReconnectCount) {
      ElMessage.error("WebSocket连接已断开，请刷新页面重试");
      return;
    }

    this.isReconnecting = true;
    setTimeout(() => {
      this.reconnectCount++;
      this.connect();
      this.isReconnecting = false;
    }, this.reconnectDelay * this.reconnectCount);
  }

  private startHeartbeat(): void {
    this.timer = setInterval(() => {
      this.send({type: "ping"});
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  public send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.messageQueue.push(data);
    }
  }

  public close(): void {
    this.forceClose = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === "visible") {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.connect();
      }
    }
  }

  private handleOnline(): void {
    console.log("网络已连接");
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }
  }

  private handleOffline(): void {
    console.log("网络已断开");
    this.close();
  }

  public destroy(): void {
    this.close();
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }
}
