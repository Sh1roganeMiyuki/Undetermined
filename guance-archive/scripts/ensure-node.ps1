<#
  ensure-node.ps1 - prepare a portable Node.js runtime for the local experience.

  Usage:
    powershell -NoProfile -ExecutionPolicy Bypass -File ensure-node.ps1 -Target <dir>

  What it does:
    - If <dir>\node.exe already runs, do nothing (idempotent).
    - Otherwise download the official portable zip (nodejs.org, with an
      npmmirror fallback), verify it is a real zip, extract it, probe that
      the bundled node.exe starts, then move it to <dir>.

  Notes:
    - ASCII only, on purpose: Windows PowerShell 5.1 reads BOM-less files as
      ANSI, so non-ASCII text here could garble console output or worse.
    - No admin rights, no system changes: everything stays inside <dir>.
    - Exit codes: 0 = runtime ready (existing or downloaded), 1 = failure.
#>
param([Parameter(Mandatory = $true)][string]$Target)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Fail([string]$msg) {
  Write-Host ("ensure-node: FAILED - " + $msg) -ForegroundColor Red
  exit 1
}

function Test-ZipSignature([string]$path) {
  try {
    $fs = [IO.File]::OpenRead($path)
    $b = New-Object byte[] 2
    [void]$fs.Read($b, 0, 2)
    $fs.Close()
    return ($b[0] -eq 0x50 -and $b[1] -eq 0x4B)  # "PK"
  } catch {
    return $false
  }
}

# Safety valve: only ever manage a directory named "...\runtime".
if ($Target -notmatch 'runtime[\\/]*$') {
  Fail ("refusing to manage unexpected target: " + $Target)
}

# Already prepared? Then there is nothing to do.
$nodeExe = Join-Path $Target 'node.exe'
if (Test-Path $nodeExe) {
  $probe = & $nodeExe --version 2>$null
  if ($LASTEXITCODE -eq 0 -and $probe) {
    Write-Host ("ensure-node: runtime already present (" + $probe + ")")
    exit 0
  }
}

# Pinned version: deterministic URL, both sources serve the same archive.
$version = 'v22.11.0'
$file = "node-$version-win-x64.zip"
$urls = @(
  "https://nodejs.org/dist/$version/$file",
  "https://npmmirror.com/mirrors/node/$version/$file"
)

$tmp = Join-Path ([IO.Path]::GetTempPath()) ("cb-node-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
$zip = Join-Path $tmp $file

$ProgressPreference = 'SilentlyContinue'
$downloaded = $false
foreach ($u in $urls) {
  Write-Host ("ensure-node: downloading " + $u)
  try {
    Invoke-WebRequest -Uri $u -OutFile $zip -UseBasicParsing -TimeoutSec 900
    if ((Get-Item $zip).Length -gt 1MB -and (Test-ZipSignature $zip)) {
      $downloaded = $true
      break
    }
    Write-Host "ensure-node: response is not a valid zip, trying next source"
  } catch {
    Write-Host ("ensure-node: download failed - " + $_.Exception.Message)
  }
}

if (-not $downloaded) {
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
  Fail "could not download the Node.js runtime (check network / proxy)"
}

$err = $null
try {
  $extract = Join-Path $tmp 'x'
  Expand-Archive -Path $zip -DestinationPath $extract -Force
  $inner = Get-ChildItem $extract -Directory | Select-Object -First 1
  if (-not $inner) { throw 'unexpected archive layout' }

  $probe = & (Join-Path $inner.FullName 'node.exe') --version 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $probe) { throw 'extracted node.exe failed to run' }

  if (Test-Path $Target) { Remove-Item $Target -Recurse -Force }
  New-Item -ItemType Directory -Path (Split-Path $Target) -Force | Out-Null
  Move-Item -Path $inner.FullName -Destination $Target
  Write-Host ("ensure-node: ready (" + $probe + ")")
} catch {
  $err = $_.Exception.Message
} finally {
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

if ($err) { Fail $err }
exit 0