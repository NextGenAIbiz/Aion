# Aion local proxy — stdlib Python only, no install required.
# ─────────────────────────────────────────────────────────────────────────────
# Runs an HTTP proxy at  http://localhost:9443  →  http://10.161.112.104:3000
#
# Browsers allow http://localhost from HTTPS pages (it's a "secure context"),
# so Aion tools on GitHub Pages can reach your internal HTTP LLM server with
# no HTTPS certificates or extra setup.
#
# Just run this script. Keep it running while you use the tools.
# In Aion Settings, enter your real API URL as-is: http://10.161.112.104:3000/v1
# ─────────────────────────────────────────────────────────────────────────────

Set-Location $PSScriptRoot

# Check Python is available
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python not found. Please install Python 3.8+ from https://python.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  Aion proxy" -ForegroundColor Green
Write-Host "  Listening : http://localhost:9443" -ForegroundColor Cyan
Write-Host "  Target    : http://10.161.112.104:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  In Aion Settings, keep your real URL:" -ForegroundColor Yellow
Write-Host "    http://10.161.112.104:3000/v1" -ForegroundColor White
Write-Host "  The tools auto-route via proxy on GitHub Pages." -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

python proxy.py
