# Super Vision AI Education Platform

Super Vision is a professional-grade, real-time AI monitoring system designed for educators. Utilizing a high-performance **Split-Screen Dashboard**, it provides deep behavioral insights into student engagement while maintaining academic integrity through advanced proctoring telemetry.

## 🚀 Key Features
- **Split-Screen Teacher Control Center**: A dedicated "Global Telemetry" panel on the left for at-a-glance class metrics, and a "Real-time Telemetry" feed on the right for individual student deep-dives.
- **AI Engagement Analysis**: Real-time detection of student emotions (Focused, Confused, Neutral) using facial landmark analysis.
- **Academic Integrity Proctoring**: Instant alerts for "Looking away" ($>4s$) and person detection ("No face" or "Multiple faces").
- **High-Density Telemetry**: Visualizes student behavior trends using real-time area charts.
- **Premium Aesthetics**: Fully responsive dark-themed UI built with glassmorphism and Framer Motion animations.

## 🛠 Tech Stack
- **Backend**: FastAPI (Python), MediaPipe, OpenCV, WebSockets.
- **Frontend**: Next.js 15, Tailwind CSS v4, Recharts, Framer Motion.
- **CV Engine**: Custom landmark-based processing for low-latency, cost-effective monitoring.

---

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- Node.js 18+ & npm

### 2. Backend Setup
1. Open a terminal in the project root.
2. Create and activate the virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/Mac:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   python -m backend.main
   ```
   *The server will start on `http://localhost:8000`*

### 3. Frontend Setup
1. Open a new terminal in the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:3000`*

---

## How to Run & Test
1. **Teacher Dashboard**: Open `http://localhost:3000/teacher` in your browser. This will show a "Waiting for students" message.
2. **Student Portal**: In a separate browser window or tab, open `http://localhost:3000/student`. Allow camera permissions.
3. **Verify Monitoring**:
   - **Focused**: Look at the screen naturally. The teacher board should show "Focused" (Green).
   - **Confusion**: Furrow your brows and tilt your head slightly. Watch the "Confusion Score" rise and the status turn Yellow on the dashboard.
   - **Proctor Alert**: Look away from the screen for more than 4 seconds. The dashboard should flash a Red alert.
   - **Multiple People**: Bring another person into the frame to trigger a "Multiple faces" alert.

---

## Author
Builded by **Pragati Gadkar**
