from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import json


class ConnectionManager:
    """Manages WebSocket connections."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        """Broadcast message to all connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                continue

    async def broadcast_json(self, data: dict):
        """Broadcast JSON message to all connected clients."""
        await self.broadcast(json.dumps(data))


manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back with timestamp
            response = {
                "type": "message",
                "data": data,
                "timestamp": str(datetime.now().isoformat()),
            }
            await manager.send_personal_message(json.dumps(response), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast_json({
            "type": "disconnect",
            "message": "Client disconnected"
        })


from datetime import datetime
