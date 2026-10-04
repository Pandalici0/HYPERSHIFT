[CmdletBinding(SupportsShouldProcess = $true)]
param([string]$SteamPath)

$ErrorActionPreference = 'Stop'
if (-not $SteamPath) {
    $SteamPath = (Get-ItemProperty -LiteralPath 'HKCU:\Software\Valve\Steam' -ErrorAction SilentlyContinue).SteamPath
    if (-not $SteamPath) { $SteamPath = Join-Path ${env:ProgramFiles(x86)} 'Steam' }
}
$SteamPath = [IO.Path]::GetFullPath($SteamPath)
if (-not (Test-Path -LiteralPath (Join-Path $SteamPath 'steam.exe') -PathType Leaf)) {
    throw "Steam was not found at $SteamPath. Use -SteamPath with your Steam installation directory."
}
$millenniumPath = Join-Path $SteamPath 'millennium'
if (-not (Test-Path -LiteralPath $millenniumPath -PathType Container)) {
    throw 'Install Millennium before installing this theme.'
}
$themeRoot = [IO.Path]::GetFullPath((Join-Path $millenniumPath 'themes'))
$targetPath = [IO.Path]::GetFullPath((Join-Path $themeRoot 'hypershift'))
if ([IO.Path]::GetDirectoryName($targetPath) -ne $themeRoot) { throw 'Unexpected theme target.' }
if ($targetPath.TrimEnd('\') -eq $PSScriptRoot.TrimEnd('\')) { throw 'The source is already the installed theme directory.' }
$manifestPath = Join-Path $PSScriptRoot 'skin.json'
$skin = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($skin.name -ne 'HYPERSHIFT' -or $skin.author -ne 'pandalici0') { throw 'Unexpected source manifest.' }
$names = @('skin.json', 'assets/hypershift-concept.png', 'README.md', 'README.de.md', 'LICENSE', 'NOTICE.md', 'CHANGELOG.md', 'Install.ps1')
$names += @(Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'docs') -File -Recurse | ForEach-Object { 'docs/' + $_.FullName.Substring((Join-Path $PSScriptRoot 'docs').Length + 1).Replace('\', '/') })
$names += @(Get-ChildItem -LiteralPath $PSScriptRoot -File | Where-Object { $_.Extension -in '.css', '.js' } | ForEach-Object { $_.Name })
foreach ($name in $names) {
    if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot $name) -PathType Leaf)) { throw "Missing source file: $name" }
}
if ($PSCmdlet.ShouldProcess($targetPath, "Back up existing HYPERSHIFT, install version $($skin.version) and verify hashes")) {
    if (Test-Path -LiteralPath $targetPath) {
        $backupRoot = Join-Path $millenniumPath 'theme-backups'
        New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
        $backupPath = Join-Path $backupRoot ('hypershift-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
        Copy-Item -LiteralPath $targetPath -Destination $backupPath -Recurse
        Write-Output "Backup: $backupPath"
    }
    foreach ($name in $names) {
        $sourcePath = Join-Path $PSScriptRoot $name
        $destinationPath = Join-Path $targetPath $name
        New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($destinationPath)) -Force | Out-Null
        Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
        if ((Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $destinationPath -Algorithm SHA256).Hash) {
            throw "Installed file failed verification: $name"
        }
    }
    Write-Output "HYPERSHIFT $($skin.version) installed and verified: $targetPath"
    Write-Output 'Select HYPERSHIFT in Millennium, enable theme JavaScript, and reload the theme.'
}
