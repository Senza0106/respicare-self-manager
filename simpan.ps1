param([string]$pesan = "update: pembaruan fitur RespiCare")
npm run build
if ($LASTEXITCODE -eq 0) {
  git add .
  git commit -m $pesan
  git push
  Write-Host "Berhasil build, commit, dan push ke GitHub: $pesan" -ForegroundColor Green
} else {
  Write-Host "Build gagal! Commit dibatalkan agar kode error tidak tersimpan." -ForegroundColor Red
}
