import cv2
import mediapipe as mp
import numpy as np
import time

class CVEngine:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=2,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.last_gaze_away_start = None
        self.gaze_away_duration = 0
        self.GAZE_THRESHOLD_SEC = 4.0

    def process_frame(self, frame_np):
        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame_np, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        telemetry = {
            "status": "Focused",
            "face_count": 0,
            "proctor_alert": False,
            "proctor_message": "",
            "confusion_level": 0.0,
            "engagement": "Neutral"
        }

        if not results.multi_face_landmarks:
            telemetry["face_count"] = 0
            telemetry["proctor_alert"] = True
            telemetry["proctor_message"] = "No face detected"
            return telemetry

        face_count = len(results.multi_face_landmarks)
        telemetry["face_count"] = face_count

        if face_count > 1:
            telemetry["proctor_alert"] = True
            telemetry["proctor_message"] = "Multiple faces detected"
            return telemetry

        # Single face detected, analyze behavior
        landmarks = results.multi_face_landmarks[0].landmark
        
        # 1. Gaze Tracking (Simplified check)
        # We check if eyes are looking roughly towards center
        is_looking_away = self._check_gaze(landmarks)
        if is_looking_away:
            if self.last_gaze_away_start is None:
                self.last_gaze_away_start = time.time()
            else:
                self.gaze_away_duration = time.time() - self.last_gaze_away_start
                if self.gaze_away_duration >= self.GAZE_THRESHOLD_SEC:
                    telemetry["proctor_alert"] = True
                    telemetry["proctor_message"] = "Looking away too long"
        else:
            self.last_gaze_away_start = None
            self.gaze_away_duration = 0

        # 2. Confusion Detection
        is_confused, confusion_level = self._check_confusion(landmarks)
        if is_confused:
            telemetry["status"] = "Confused"
            telemetry["engagement"] = "Confused"
        
        telemetry["confusion_level"] = confusion_level

        # 3. Excitemnt / Happy
        is_happy = self._check_happy(landmarks)
        if is_happy and not is_confused:
            telemetry["status"] = "Happy/Excited"
            telemetry["engagement"] = "High"

        return telemetry

    def _check_gaze(self, landmarks):
        # MediaPipe iris landmarks are 468-472 (left) and 473-477 (right)
        # Simplified: Check if nose tip is significantly far from center relative to face width
        # or check eye iris relative to eye corners.
        # For MVP, we use iris position
        left_iris = landmarks[468]
        right_iris = landmarks[473]
        
        # Check horizontal looking away
        # This is a heuristic, real gaze is more complex
        if left_iris.x < 0.4 or left_iris.x > 0.6:
            return True
        return False

    def _check_confusion(self, landmarks):
        # Logic: Brow furrowing + lack of smile
        # Inner brows: 55, 285. Nose bridge: 168
        # Distance between inner brows
        d_brows = abs(landmarks[55].x - landmarks[285].x)
        # Mouth corners: 61, 291
        d_mouth = abs(landmarks[61].x - landmarks[291].x)
        
        # Heuristic values (need calibration)
        is_furrowed = d_brows < 0.05 
        is_smiling = d_mouth > 0.08
        
        # Head tilt (Roll)
        # Left eye: 33, Right eye: 263
        eye_diff_y = abs(landmarks[33].y - landmarks[263].y)
        is_tilted = eye_diff_y > 0.03

        confusion_score = 0
        if is_furrowed: confusion_score += 0.6
        if is_tilted: confusion_score += 0.4
        if is_smiling: confusion_score -= 0.5

        return confusion_score > 0.5, max(0, confusion_score)

    def _check_happy(self, landmarks):
        # Distance between lip corners and height of lips
        # Mouth corners: 61, 291
        d_mouth = abs(landmarks[61].x - landmarks[291].x)
        return d_mouth > 0.09
