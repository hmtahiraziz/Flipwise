# Generates Android mipmap and iOS AppIcon PNGs from src/assets/brand/icon.png
param(
  [string]$Source = "$PSScriptRoot/../src/assets/brand/icon.png"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Save-ResizedIcon {
  param(
    [System.Drawing.Image]$SourceImage,
    [int]$Size,
    [string]$Destination
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.DrawImage($SourceImage, 0, 0, $Size, $Size)
  $graphics.Dispose()

  $dir = Split-Path $Destination -Parent
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

$sourcePath = Resolve-Path $Source
$image = [System.Drawing.Image]::FromFile($sourcePath)
$mobileRoot = Resolve-Path "$PSScriptRoot/.."

Write-Host "Generating Android launcher icons..."
$androidSizes = @{
  "mipmap-mdpi"    = 48
  "mipmap-hdpi"    = 72
  "mipmap-xhdpi"   = 96
  "mipmap-xxhdpi"  = 144
  "mipmap-xxxhdpi" = 192
}

foreach ($folder in $androidSizes.Keys) {
  $size = $androidSizes[$folder]
  $base = Join-Path $mobileRoot "android/app/src/main/res/$folder"
  Save-ResizedIcon -SourceImage $image -Size $size -Destination (Join-Path $base "ic_launcher.png")
  Save-ResizedIcon -SourceImage $image -Size $size -Destination (Join-Path $base "ic_launcher_round.png")
}

Write-Host "Generating iOS AppIcon set..."
$iosSizes = @(
  @{ Name = "Icon-20@2x.png"; Size = 40 },
  @{ Name = "Icon-20@3x.png"; Size = 60 },
  @{ Name = "Icon-29@2x.png"; Size = 58 },
  @{ Name = "Icon-29@3x.png"; Size = 87 },
  @{ Name = "Icon-40@2x.png"; Size = 80 },
  @{ Name = "Icon-40@3x.png"; Size = 120 },
  @{ Name = "Icon-60@2x.png"; Size = 120 },
  @{ Name = "Icon-60@3x.png"; Size = 180 },
  @{ Name = "Icon-1024.png"; Size = 1024 }
)

$iosDir = Join-Path $mobileRoot "ios/mobile/Images.xcassets/AppIcon.appiconset"
foreach ($entry in $iosSizes) {
  Save-ResizedIcon -SourceImage $image -Size $entry.Size -Destination (Join-Path $iosDir $entry.Name)
}

$image.Dispose()
Write-Host "Done."
