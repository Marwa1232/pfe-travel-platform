# Start the Symfony server in the background
cd C:\xampp\htdocs\apppfe\backend
Start-Process powershell -ArgumentList "-Command php -S localhost:8000 -t public"

# Check if port 8000 is in use
Start-Sleep -Seconds 2
$process = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($process) { Write-Host "Server started on port 8000" } else { Write-Host "Port 8000 not in use" }