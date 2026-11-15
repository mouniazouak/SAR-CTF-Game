# NISAR mission data

Les fichiers `.h5` NISAR sont conservés localement dans `data/raw/nisar/`.
Ils sont volontairement exclus de GitHub car ils sont volumineux.

Le manifeste `data/manifest.json` décrit les scènes utilisées par le premier
challenge. La prochaine étape sera d'extraire une couche lisible par le web
(PNG/GeoTIFF/COG) à partir de ces fichiers HDF5.

La couche extraite pour le prototype est `frequencyA/HHHH` :

- `*.tif` : GeoTIFF scientifique géoréférencé ;
- `*.png` : aperçu léger pour l’interface web.

Les fichiers HDF5 originaux restent conservés comme source.

## Nettoyage général pour toutes les futures images

Le projet ne compare jamais directement deux images téléchargées. Pour chaque
nouvelle mission, le pipeline doit :

1. vérifier le track, le frame, la direction, la fréquence, la polarisation et
   la couche ;
2. refuser la paire si la géométrie n’est pas compatible ;
3. supprimer les pixels NoData ;
4. convertir les valeurs linéaires en dB si nécessaire ;
5. découper l’intersection géographique commune ;
6. reprojeter/rééchantillonner sur la même grille de pixels ;
7. normaliser les deux scènes avec les mêmes percentiles robustes 2–98 ;
8. calculer `change.png` seulement après ces étapes.

Les règles sont centralisées dans `data/processing-config.json` et la
validation TypeScript est disponible dans `src/lib/nisar-comparison.ts`.

Le script applique ce traitement à n’importe quelle paire NISAR. Par défaut,
il refuse une paire dont la géométrie diffère. Pour une paire destinée seulement
à la visualisation, `-AllowGeometryMismatch` aligne les deux scènes sur une
intersection et une grille communes ; `metadata.json` indique alors
`visual-only-aligned`.

Pour préparer une paire compatible depuis PowerShell :

```powershell
.\scripts\prepare-nisar-pair.ps1 `
  -Before 'C:\chemin\before.h5' `
  -After 'C:\chemin\after.h5' `
  -OutputDirectory 'data\processed\nisar\mission-01'
```

Pour aligner visuellement une paire dont le track, le frame ou la direction
diffèrent :

```powershell
.\scripts\prepare-nisar-pair.ps1 `
  -Before 'C:\chemin\before.h5' `
  -After 'C:\chemin\after.h5' `
  -OutputDirectory 'data\processed\nisar\mission-01' `
  -AllowGeometryMismatch
```

Sans `-AllowGeometryMismatch`, le script s’arrête automatiquement si le track,
le frame ou la direction ne correspondent pas. L’option d’alignement ne doit
pas servir à présenter un changement scientifique validé.

## Contrat d’une mission

Chaque mission scientifique doit utiliser une paire NISAR avec le même track,
frame, direction de passage et polarisation. Seule la date doit changer, afin
que la différence observée corresponde à un changement réel et non à une
géométrie de prise de vue différente.

La mission Jasper est préparée dans `data/missions/jasper-fire-scar.json`.
Après téléchargement et conversion, elle devra produire `before.png`,
`after.png`, `change.png`, `metadata.json`, `grid.json`, `weather.json` et
`truth.geojson`. La météo sera récupérée côté serveur par `/api/weather` via
l’archive historique gratuite Open-Meteo.
