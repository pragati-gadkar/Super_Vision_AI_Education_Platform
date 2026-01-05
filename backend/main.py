from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import base64
import cv2
import numpy as np
from .cv_engine import CVEngine
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cv_engine = CVEngine()

# Store active teacher connections to broadcast student updates
teacher_connections = set()

@app.websocket("/ws/student/{student_id}")
async def student_websocket(websocket: WebSocket, student_id: str):
    await websocket.accept()
    try:
        while True:
            # Receive frame as base64 string
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if "image" in message:
                image_data = message["image"].split(",")[1]
                image_bytes = base64.b64decode(image_data)
                
                # Convert to numpy array
                nparr = np.frombuffer(image_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    # Process frame
                    telemetry = cv_engine.process_frame(frame)
                    telemetry["student_id"] = student_id
                    telemetry["timestamp"] = asyncio.get_event_loop().time()
                    
                    # Broadcast to teachers
                    await broadcast_to_teachers(telemetry)
    except WebSocketDisconnect:
        print(f"Student {student_id} disconnected")
    except Exception as e:
        print(f"Error in student socket: {e}")

@app.websocket("/ws/teacher")
async def teacher_websocket(websocket: WebSocket):
    await websocket.accept()
    teacher_connections.add(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        teacher_connections.remove(websocket)
    except Exception as e:
        print(f"Error in teacher socket: {e}")
        if websocket in teacher_connections:
            teacher_connections.remove(websocket)

async def broadcast_to_teachers(data):
    if not teacher_connections:
        return
    
    message = json.dumps(data)
    dead_connections = set()
    for conn in teacher_connections:
        try:
            await conn.send_text(message)
        except Exception:
            dead_connections.add(conn)
            
    for conn in dead_connections:
        teacher_connections.remove(conn)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
