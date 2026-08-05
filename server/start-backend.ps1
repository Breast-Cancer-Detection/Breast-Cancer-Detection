$ErrorActionPreference = "Stop"

$serverRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $serverRoot ".venv\Scripts\python.exe"
$matplotlibConfig = Join-Path $serverRoot ".matplotlib"

if (-not (Test-Path $python)) {
  throw "Backend virtualenv not found. Run: cd server; python -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt"
}

New-Item -ItemType Directory -Force -Path $matplotlibConfig | Out-Null
$env:MPLCONFIGDIR = $matplotlibConfig

Set-Location $serverRoot
& $python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
