#!/bin/bash
PESAN="${1:-update: pembaruan fitur RespiCare}"
npm run build && git add . && git commit -m "$PESAN" && git push
