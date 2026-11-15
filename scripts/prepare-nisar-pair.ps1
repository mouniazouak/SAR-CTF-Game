param(
  [Parameter(Mandatory = $true)][string]$Before,
  [Parameter(Mandatory = $true)][string]$After,
  [Parameter(Mandatory = $true)][string]$OutputDirectory,
  [string]$GdalBin = 'C:\Program Files\GDAL',
  [string]$GdalDriverPath = '',
  [ValidateSet('linear', 'db')][string]$SourceUnits = 'linear',
  [switch]$AllowGeometryMismatch,
  [int]$PreviewWidth = 1600,
  [double]$DbMin = -60,
  [double]$DbMax = 0
)

$ErrorActionPreference = 'Stop'

if (-not $GdalDriverPath) {
  $localPluginPath = Join-Path $PSScriptRoot '..\..\gdal-plugins-temp'
  if (Test-Path (Join-Path $localPluginPath 'gdal_HDF5.dll')) { $GdalDriverPath = (Resolve-Path $localPluginPath).Path }
}
if (Test-Path (Join-Path $GdalBin 'gdal-data')) { $env:GDAL_DATA = Join-Path $GdalBin 'gdal-data' }
if (Test-Path (Join-Path $GdalBin 'projlib')) { $env:PROJ_LIB = Join-Path $GdalBin 'projlib' }
if ($GdalDriverPath -and (Test-Path $GdalDriverPath)) { $env:GDAL_DRIVER_PATH = $GdalDriverPath }

function Get-GdalCommand([string]$Name) {
  $candidate = Join-Path $GdalBin $Name
  if (-not (Test-Path $candidate)) { throw "GDAL command not found: $candidate" }
  return $candidate
}

function Get-ProductGeometry([string]$Path) {
  $name = [IO.Path]::GetFileNameWithoutExtension($Path)
  $match = [regex]::Match($name, 'GCOV_(\d+)_(\d+)_([AD])_(\d+)_')
  if (-not $match.Success -and [IO.Path]::GetExtension($Path) -in @('.tif', '.tiff')) {
    return [pscustomobject]@{ Track = $null; Frame = $null; Direction = $null; Known = $false }
  }
  if (-not $match.Success) { throw "Cannot read NISAR track/frame/direction from: $name" }
  return [pscustomobject]@{
    Track = [int]$match.Groups[1].Value
    Frame = [int]$match.Groups[2].Value
    Direction = $match.Groups[3].Value
    Known = $true
  }
}

if (-not (Test-Path $Before -PathType Leaf)) { throw "Before file not found: $Before" }
if (-not (Test-Path $After -PathType Leaf)) { throw "After file not found: $After" }

$beforeGeometry = Get-ProductGeometry $Before
$afterGeometry = Get-ProductGeometry $After
$geometryCompatible = $beforeGeometry.Known -and $afterGeometry.Known -and
  $beforeGeometry.Track -eq $afterGeometry.Track -and
  $beforeGeometry.Frame -eq $afterGeometry.Frame -and
  $beforeGeometry.Direction -eq $afterGeometry.Direction
if (-not $geometryCompatible -and -not $AllowGeometryMismatch) {
  throw "The pair is not comparable: track, frame and pass direction must match. Use -AllowGeometryMismatch only for a visual alignment."
}
if (-not $geometryCompatible) {
  Write-Warning 'Geometry differs. The output will be visually aligned, but it must not be interpreted as a scientific change measurement.'
}

$gdalinfo = Get-GdalCommand 'gdalinfo.exe'
$gdalTranslate = Get-GdalCommand 'gdal_translate.exe'
$gdalwarp = Get-GdalCommand 'gdalwarp.exe'
$gdal = Get-GdalCommand 'gdal.exe'
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

function Find-HhhhSubdataset([string]$Path) {
  if ([IO.Path]::GetExtension($Path) -in @('.tif', '.tiff')) { return $Path }
  $info = & $gdalinfo '-json' $Path | ConvertFrom-Json -AsHashtable
  $metadata = if ($info.metadata.ContainsKey('SUBDATASETS')) { $info.metadata['SUBDATASETS'] } else { $info.metadata[''] }
  $subdatasetNames = @($metadata.Keys | Where-Object { $_ -like 'SUBDATASET_*_NAME' } | ForEach-Object { $metadata[$_] })
  $candidate = @($subdatasetNames | Where-Object { $_ -match 'frequencyA/HHHH' } | Select-Object -First 1)
  $hasHhhhMetadata = @($metadata.Keys | Where-Object { $_ -like '*frequencyA_HHHH*' }).Count -gt 0
  if ($candidate.Count -eq 0 -and $hasHhhhMetadata) { return $Path }
  if ($candidate.Count -eq 0) { throw "HHHH subdataset not found in $Path" }
  return $candidate[0]
}

function Get-Bounds([string]$Dataset) {
  $info = (& $gdalinfo '-json' $Dataset | ConvertFrom-Json -AsHashtable)
  $points = @($info.cornerCoordinates.upperLeft, $info.cornerCoordinates.upperRight, $info.cornerCoordinates.lowerLeft, $info.cornerCoordinates.lowerRight)
  $xs = $points | ForEach-Object { if ($_ -is [array]) { [double]$_[0] } else { [double]$_.x } }
  $ys = $points | ForEach-Object { if ($_ -is [array]) { [double]$_[1] } else { [double]$_.y } }
  [pscustomobject]@{
    West = ($xs | Measure-Object -Minimum).Minimum
    East = ($xs | Measure-Object -Maximum).Maximum
    South = ($ys | Measure-Object -Minimum).Minimum
    North = ($ys | Measure-Object -Maximum).Maximum
  }
}

function Convert-Scene([string]$Path, [string]$Role, $Intersection) {
  $subdataset = Find-HhhhSubdataset $Path
  $raw = Join-Path $OutputDirectory "$Role-raw.tif"
  $aligned = Join-Path $OutputDirectory "$Role-aligned.tif"
  $clean = Join-Path $OutputDirectory "$Role-clean.tif"
  $png = Join-Path $OutputDirectory "$Role.png"
  & $gdalTranslate '-of' 'GTiff' '-ot' 'Float32' $subdataset $raw
  & $gdalwarp '-overwrite' '-te' $Intersection.West $Intersection.South $Intersection.East $Intersection.North '-ts' $PreviewWidth '0' '-r' 'bilinear' '-srcnodata' '0' '-dstnodata' '-9999' $raw $aligned
  if ($SourceUnits -eq 'linear') {
    & $gdal 'raster' 'calc' '--overwrite' '--input' "A=$aligned" '--output' $clean '--calc=10*log10(A)' '--output-data-type=Float32' '--nodata' '-9999' '--propagate-nodata'
  } else {
    Copy-Item -LiteralPath $aligned -Destination $clean -Force
  }
  & $gdalTranslate '-of' 'PNG' '-scale' $DbMin $DbMax '0' '255' '-a_nodata' '0' $clean $png
  return [pscustomobject]@{ role = $Role; source = $Path; subdataset = $subdataset; aligned = $aligned; cleaned = $clean; preview = $png }
}

$beforeSubdataset = Find-HhhhSubdataset $Before
$afterSubdataset = Find-HhhhSubdataset $After
$beforeBounds = Get-Bounds $beforeSubdataset
$afterBounds = Get-Bounds $afterSubdataset
$intersection = [pscustomobject]@{
  West = [math]::Max($beforeBounds.West, $afterBounds.West)
  South = [math]::Max($beforeBounds.South, $afterBounds.South)
  East = [math]::Min($beforeBounds.East, $afterBounds.East)
  North = [math]::Min($beforeBounds.North, $afterBounds.North)
}
if ($intersection.West -ge $intersection.East -or $intersection.South -ge $intersection.North) {
  throw 'The two scenes do not have a geographic intersection.'
}

$beforeOutput = Convert-Scene $Before 'before' $intersection
$afterOutput = Convert-Scene $After 'after' $intersection
$change = Join-Path $OutputDirectory 'change.tif'
$changePng = Join-Path $OutputDirectory 'change.png'
& $gdal 'raster' 'calc' '--overwrite' '--input' "A=$($beforeOutput.cleaned)" '--input' "B=$($afterOutput.cleaned)" '--output' $change '--calc=A-B' '--output-data-type=Float32' '--nodata' '-9999' '--propagate-nodata'
& $gdalTranslate '-of' 'PNG' '-scale' '-10' '10' '0' '255' '-a_nodata' '0' $change $changePng

$metadata = [ordered]@{
  createdAt = (Get-Date).ToUniversalTime().ToString('o')
  before = $beforeOutput
  after = $afterOutput
  geometry = $beforeGeometry
  geometryCompatible = $geometryCompatible
  comparisonMode = if ($geometryCompatible) { 'scientific-ready' } else { 'visual-only-aligned' }
  intersection = $intersection
  processing = [ordered]@{
    layer = 'HHHH'
    removeNoData = $true
    convertLinearToDb = $SourceUnits -eq 'linear'
    commonIntersection = $true
    commonPixelGrid = $true
    robustPercentiles = @(2, 98)
    warning = if ($geometryCompatible) { $null } else { 'Different track/frame/pass direction: change.png is for visual inspection only.' }
  }
}
$metadata | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $OutputDirectory 'metadata.json')
Write-Output "Prepared pair in $OutputDirectory ($($metadata.comparisonMode))"
