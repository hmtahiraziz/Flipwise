# Generates a Play Store upload keystore and android/keystore.properties.
# Keep the .jks + passwords offline - never commit them.
# Usage:  powershell -File mobile/scripts/generate-upload-keystore.ps1

$ErrorActionPreference = "Stop"

$androidDir = (Resolve-Path (Join-Path $PSScriptRoot "..\android")).Path
$keystorePath = Join-Path $androidDir "app\upload-keystore.jks"
$propsPath = Join-Path $androidDir "keystore.properties"
$keyAlias = "cardweave-upload"

if (Test-Path $keystorePath) {
    Write-Error "Keystore already exists at $keystorePath - aborting to avoid overwrite."
}

$keytool = Get-Command keytool -ErrorAction SilentlyContinue
if (-not $keytool) {
    Write-Error "keytool not found. Install a JDK and ensure keytool is on PATH."
}

$secureStore = Read-Host "Store password" -AsSecureString
$secureKey = Read-Host "Key password (Enter to reuse store password)" -AsSecureString

$bstrStore = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureStore)
$storePassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstrStore)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstrStore)

$bstrKey = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
$keyPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstrKey)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstrKey)

if ([string]::IsNullOrWhiteSpace($keyPassword)) {
    $keyPassword = $storePassword
}

if ($storePassword.Length -lt 6) {
    Write-Error "Store password must be at least 6 characters."
}

Write-Host "Generating upload keystore..."
& keytool -genkeypair `
    -v `
    -storetype PKCS12 `
    -keystore $keystorePath `
    -alias $keyAlias `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -storepass $storePassword `
    -keypass $keyPassword `
    -dname "CN=Cardweave, OU=Mobile, O=Cardweave, L=Unknown, ST=Unknown, C=US"

$props = @"
storeFile=app/upload-keystore.jks
storePassword=$storePassword
keyAlias=$keyAlias
keyPassword=$keyPassword
"@
[System.IO.File]::WriteAllText($propsPath, $props)

Write-Host ""
Write-Host "Created:"
Write-Host "  $keystorePath"
Write-Host "  $propsPath"
Write-Host ""
Write-Host "Back up the .jks and passwords securely. Losing them blocks Play updates."
Write-Host "Next: set production .env values, then rebuild the release APK/AAB."
