# PowerShell HTTP Server serving static files using built-in [System.Net.HttpListener]
$port = 8080
$address = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($address)

$Cwd = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Cwd

Write-Host "=========================================" -ForegroundColor Green
Write-Host "CredInd Web Server Starting on: $address" -ForegroundColor Green
Write-Host "Workspace folder: $Cwd" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Green

try {
    $listener.Start()
} catch {
    Write-Host "Failed to start listener on $port. Ensure port is not occupied or run as Administrator if required." -ForegroundColor Red
    Exit 1
}

Write-Host "Listening... Close window to terminate." -ForegroundColor Cyan

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }
        
        $filePath = Join-Path $Cwd $urlPath.Substring(1)
        Write-Host "Request: $($request.HttpMethod) $urlPath -> $filePath" -ForegroundColor Gray
        
        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath)
            $contentType = "text/plain"
            switch ($extension) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".json" { $contentType = "application/json; charset=utf-8" }
                ".png"  { $contentType = "image/png" }
                ".svg"  { $contentType = "image/svg+xml" }
            }
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errMessage = "404 Not Found"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($errMessage)
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        
        $response.OutputStream.Close()
    } catch {
        Write-Host "Error processing request: $_" -ForegroundColor Red
    }
}
