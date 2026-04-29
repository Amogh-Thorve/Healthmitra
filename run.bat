@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

title HealthMitra Scan Runner

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "VENV_PYTHON=%ROOT_DIR%\venv\Scripts\python.exe"

set "DOWNLOAD_MODELS=0"
if /I "%~1"=="--download-models" set "DOWNLOAD_MODELS=1"

echo =======================================================
echo   HealthMitra Scan - Automated Runner and Setup
echo   Version 2.2 (Fast Startup)
echo =======================================================
echo.

:: ── Step 1: Cleanup Existing Processes ──────────────────────────────
echo [1/7] Closing existing HealthMitra tasks...

:: Using a safer way to check and kill ports
for %%p in (8000 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr /c:"LISTENING" ^| findstr ":%%p" 2^>nul') do (
        if not "%%a"=="" (
            echo [CLEANUP] Killing PID %%a on port %%p...
            taskkill /F /PID %%a >nul 2>&1
        )
    )
)
echo [OK] Cleanup complete.
echo.

:: ── Step 2: Python venv + pip ────────────────────────────────────────
echo [2/7] Setting up Backend (Python venv + pip)...

set "PY_CMD="
for %%V in (3.12 3.11 3.10) do (
    if not defined PY_CMD (
        py -%%V -c "import sys" >nul 2>&1
        if not errorlevel 1 set "PY_CMD=py -%%V"
    )
)
if not defined PY_CMD (
    python --version >nul 2>&1
    if not errorlevel 1 (
        for /f %%I in ('python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"') do set "PY_VER=%%I"
        for %%V in (3.10 3.11 3.12) do (
            if "!PY_VER!"=="%%V" set "PY_CMD=python"
        )
    )
)
if not defined PY_CMD (
    echo [ERROR] Supported Python not found.
    echo         Install Python 3.10, 3.11, or 3.12 from https://python.org
    pause
    exit /b 1
)
for /f %%I in ('!PY_CMD! -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"') do set "PY_VER=%%I"
echo [OK] Using Python !PY_VER! via "!PY_CMD!".

set "RECREATE_VENV=0"
if exist "venv\Scripts\python.exe" (
    "venv\Scripts\python.exe" -c "import sys; assert sys.version_info[:2] in [(3,10),(3,11),(3,12)]" >nul 2>&1
    if errorlevel 1 (
        echo [SETUP] Existing venv is incompatible, recreating with !PY_VER!...
        set "RECREATE_VENV=1"
    )
)
if "!RECREATE_VENV!"=="1" (
    rmdir /s /q "venv"
)
if not exist "venv" (
    echo [SETUP] Creating virtual environment...
    !PY_CMD! -m venv venv
)

if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment creation failed.
    pause
    exit /b 1
)

call "venv\Scripts\activate.bat"
set "NEED_PIP_INSTALL=0"
if not exist "venv\.deps_installed" set "NEED_PIP_INSTALL=1"
if exist "venv\.deps_installed" (
    for %%I in ("requirements.txt") do set "REQ_TIME=%%~tI"
    for %%I in ("venv\.deps_installed") do set "VENV_TIME=%%~tI"
    if not "!REQ_TIME!"=="!VENV_TIME!" set "NEED_PIP_INSTALL=1"
)

if "!NEED_PIP_INSTALL!"=="1" (
    echo [SETUP] Syncing backend dependencies...
    "venv\Scripts\python.exe" -m pip install --upgrade pip >nul 2>&1
    "venv\Scripts\python.exe" -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] pip install failed. Check requirements.txt and internet connection.
        pause
        exit /b 1
    )
    copy /y "requirements.txt" "venv\.deps_installed" >nul
) else (
    echo [SKIP] Backend dependencies already up to date.
)
set "PYTHON_EXE=venv\Scripts\python.exe"
echo [OK] Backend dependencies ready.
echo.

:: ── Step 3: Frontend npm install ─────────────────────────────────────
echo [3/7] Setting up Frontend (npm install)...

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] frontend\ directory not found.
    pause
    exit /b 1
)

cd frontend
set "NEED_NPM_INSTALL=0"
if not exist "node_modules" set "NEED_NPM_INSTALL=1"
if not exist ".deps_installed" set "NEED_NPM_INSTALL=1"
if exist ".deps_installed" (
    for %%I in ("package.json") do set "PKG_TIME=%%~tI"
    for %%I in (".deps_installed") do set "NPM_TIME=%%~tI"
    if not "!PKG_TIME!"=="!NPM_TIME!" set "NEED_NPM_INSTALL=1"
)

if "!NEED_NPM_INSTALL!"=="1" (
    echo [SETUP] Syncing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        cd ..
        pause
        exit /b 1
    )
    copy /y "package.json" ".deps_installed" >nul
) else (
    echo [SKIP] Frontend dependencies already up to date.
)
cd ..
echo [OK] Frontend dependencies ready.
echo.

:: ── Step 4: Create model directories ────────────────────────────────
echo [4/7] Preparing AI model directories...
if not exist "backend\models" mkdir "backend\models"
if not exist "backend\models\yolov8-chest-xray" mkdir "backend\models\yolov8-chest-xray"
if not exist "backend\models\chexfract-maira2"  mkdir "backend\models\chexfract-maira2"
if not exist "backend\models\yolov8-fracture"   mkdir "backend\models\yolov8-fracture"
echo [OK] Directories ready.
echo.

:: ── Step 5: Optional model downloads ────────────────────────────────
if not "%DOWNLOAD_MODELS%"=="1" goto skip_model_downloads

echo [5/6] Downloading X-Ray AI models (real models - no simulation)...
echo       Total download approximately 4 GB. Please wait.
echo.

echo [MODEL 1/3] YOLOv8m Chest X-Ray - pneumonia detection
if exist "backend\models\yolov8-chest-xray\best.pt" (
    echo           [SKIP] Already downloaded.
) else (
    echo           Downloading from keremberke/yolov8m-chest-xray-classification...
    "%PYTHON_EXE%" -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='keremberke/yolov8m-chest-xray-classification', local_dir='backend/models/yolov8-chest-xray', repo_type='model', ignore_patterns=['*.md','*.txt'])"
    if errorlevel 1 (
        echo [WARN] YOLOv8m chest X-ray download failed.
    ) else (
        echo [OK] YOLOv8m chest X-ray model downloaded.
    )
)
echo.

echo [MODEL 2/3] YOLOv8 Fracture Detection - fracture fallback
if exist "backend\models\yolov8-fracture\best.pt" (
    echo           [SKIP] Already downloaded.
) else (
    echo           Downloading from adeebaai/bone-fracture-yolov8...
    "%PYTHON_EXE%" -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='adeebaai/bone-fracture-yolov8', local_dir='backend/models/yolov8-fracture', repo_type='model', ignore_patterns=['*.md','*.txt'])"
    if errorlevel 1 (
        echo [WARN] YOLOv8 fracture model download failed.
    ) else (
        echo [OK] YOLOv8 fracture model downloaded.
    )
)
echo.

echo [MODEL 3/3] ChexFract MAIRA-2 - primary fracture description model
echo           Note: ~3.8 GB. This may take 10+ minutes.
if exist "backend\models\chexfract-maira2\config.json" (
    echo           [SKIP] Already downloaded.
) else (
    echo           Downloading from AIRI-Institute/chexfract-maira2...
    "%PYTHON_EXE%" -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='AIRI-Institute/chexfract-maira2', local_dir='backend/models/chexfract-maira2', repo_type='model')"
    if errorlevel 1 (
        echo [WARN] ChexFract download failed. Attempting git clone as fallback...
        git clone https://huggingface.co/AIRI-Institute/chexfract-maira2 backend\models\chexfract-maira2
    ) else (
        echo [OK] ChexFract MAIRA-2 downloaded successfully.
    )
)
echo.
goto after_model_downloads

:skip_model_downloads
echo [5/6] Skipping model downloads for faster startup.
echo       Run "run.bat --download-models" if you want to fetch missing X-ray models.
echo.

:after_model_downloads

:: ── Step 6: Medical Chatbot Knowledge Base Setup ─────────────────────
echo [6/7] Setting up Medical Chatbot (Local RAG)...

where ollama >nul 2>&1
if errorlevel 1 (
    echo [WARN] Ollama not found in PATH. Please install it from https://ollama.com
    echo        The Medical Chatbot feature will be limited.
) else (
    echo [OK] Ollama is installed.
    if not exist "backend\chroma_db" (
        echo [SETUP] Initializing Medical Knowledge Base ^(ChromaDB^)...
        echo       This may take a moment to download embedding models...
        "%PYTHON_EXE%" backend\setup_medical_kb.py
        if errorlevel 1 (
            echo [WARN] Knowledge base setup failed. You can try running:
            echo        python backend\setup_medical_kb.py manually.
        ) else (
            echo [OK] Knowledge base initialized.
        )
    ) else (
        echo [SKIP] Medical knowledge base already exists.
    )
)
echo.

:: Load .env
if exist "backend\.env" (
    echo [ENV] Loading API keys from backend\.env...
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("backend\.env") do (
        if not "%%A"=="" (
            set "%%A=%%B"
        )
    )
    echo [OK] Environment variables loaded.
)
echo.

:: ── Step 7: Launch Servers ───────────────────────────────────────────
echo [7/7] Launching backend and frontend servers...

if exist "backend\main.py" (
    echo [LAUNCH] Starting Backend at http://localhost:8000
    start "HealthMitra Backend" /D "%BACKEND_DIR%" cmd /k "title HealthMitra Backend && ..\venv\Scripts\python.exe main.py"
)

timeout /t 2 /nobreak >nul

if exist "frontend" (
    echo [LAUNCH] Starting Frontend at http://localhost:5173
    start "HealthMitra Frontend" /D "%FRONTEND_DIR%" cmd /k npm run dev
)

echo.
echo =======================================================
echo   HealthMitra Scan is running!
echo   X-Ray Agent: http://localhost:8000/api/xray-agent/status
echo   Chatbot: http://localhost:5173/chatbot (Requires Ollama)
echo =======================================================
echo.
pause
exit
