# Writes android/keystore.properties for an existing upload-keystore.jks.
# Usage:  powershell -File mobile/scripts/write-keystore-properties.ps1

$ErrorActionPreference = "Stop"

$androidDir = (Resolve-Path (Join-Path $PSScriptRoot "..\android")).Path
$keystorePath = Join-Path $androidDir "app\upload-keystore.jks"
$propsPath = Join-Path $androidDir "keystore.properties"
$keyAlias = "cardweave-upload"

if (-not (Test-Path $keystorePath)) {
    Write-Error "Missing $keystorePath - create the keystore first."
}

$secureStore = Read-Host "Store password (same as when you created the .jks)" -AsSecureString
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

# Verify the password unlocks the keystore before writing properties.
& keytool -list -keystore $keystorePath -storepass $storePassword -alias $keyAlias | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Could not open keystore with that password/alias."
}

$props = @"
storeFile=app/upload-keystore.jks
storePassword=$storePassword
keyAlias=$keyAlias
keyPassword=$keyPassword
"@
[System.IO.File]::WriteAllText($propsPath, $props)

Write-Host "Wrote $propsPath"
