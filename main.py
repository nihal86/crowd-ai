
import cv2
import json
import threading
import time
from flask import Flask, Response, jsonify, request
from ultralytics import YOLO

app = Flask(__name__)

# Load YOLOv8 model
model = YOLO('yolov8n.pt')

# Global state
state = {
    "current_source": "0",  # Default to webcam
    "people_count": 0,
    "risk_level": "LOW",
    "is_running": True
}

# Video capturing management
class VideoStreamer:
    def __init__(self):
        self.camera = None
        self.source = None
        self.lock = threading.Lock()

    def set_source(self, source):
        with self.lock:
            if self.camera:
                self.camera.release()
            
            # Convert numeric strings to int (for webcam indices)
            try:
                processed_source = int(source)
            except ValueError:
                processed_source = source
                
            self.camera = cv2.VideoCapture(processed_source)
            self.source = source
            print(f"Source switched to: {source}")

    def get_frame(self):
        with self.lock:
            if not self.camera or not self.camera.isOpened():
                return None
            success, frame = self.camera.read()
            if not success:
                # If file/stream ends, restart if it's not a webcam
                if isinstance(self.source, str) and not self.source.isdigit():
                    self.camera.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    success, frame = self.camera.read()
                if not success:
                    return None
            return frame

streamer = VideoStreamer()
streamer.set_source(state["current_source"])

def get_risk_level(count):
    if count < 10:
        return "LOW"
    elif 10 <= count <= 25:
        return "MEDIUM"
    else:
        return "HIGH"

def generate_frames():
    global state
    while True:
        frame = streamer.get_frame()
        if frame is None:
            time.sleep(0.1)
            continue
            
        # AI Processing
        results = model.predict(source=frame, classes=[0], conf=0.30, iou=0.45, verbose=False)
        
        people_count = 0
        for r in results:
            boxes = r.boxes
            people_count = len(boxes)
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
                conf = float(box.conf[0])
                cv2.putText(frame, f"Person {conf:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        
        state["people_count"] = people_count
        state["risk_level"] = get_risk_level(people_count)
        
        # HUD
        cv2.putText(frame, f"SOURCE: {state['current_source']}", (30, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"COUNT: {people_count}", (30, 70), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # Encode
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stats')
def stats():
    return jsonify({
        "people_count": state["people_count"],
        "risk_level": state["risk_level"],
        "current_source": state["current_source"]
    })

@app.route('/set_source', methods=['POST'])
def set_source():
    data = request.json
    new_source = data.get("source")
    if new_source is not None:
        state["current_source"] = str(new_source)
        streamer.set_source(state["current_source"])
        return jsonify({"status": "success", "source": state["current_source"]})
    return jsonify({"status": "error", "message": "No source provided"}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
