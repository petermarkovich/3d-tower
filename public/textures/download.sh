#!/bin/bash

urls=(
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/lsbits.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/outdoorarmchair.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/outdoorsofa.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/outdoortable.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/playground.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/podiumblack.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/podiumconc.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/shadow.png"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/soil.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/terrace.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/towerablack.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/toweraceiling.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/towerafloorplates.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/towerblack.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree002.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree002a.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree003.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree003a.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree004.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree004a.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree005.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree005a.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree006.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree006a.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree007.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree007a.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree008.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree008a.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree009.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree009a.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree010.jpg"
  "https://voltaskai.endover.ee/wp-content/uploads/2026/03/tree010a.jpg"
)

for url in "${urls[@]}"; do
  echo "Downloading $(basename "$url")..."
  curl -O "$url"
done

echo "Done!"