"""Export clearer before/after PNGs for the game (grayscale HH by default, --color for HH / HV / HH-HV).

Same crop and same lat/lon grid as the notebooks, so the bounds in metadata.json stay valid.
Usage (from the scripts/ folder):  python export_display_png.py [output_dir_root]
"""
import glob
import sys

import h5py
import numpy as np
from PIL import Image
from pyproj import Transformer
from rasterio.transform import from_origin
from rasterio.warp import Resampling, calculate_default_transform, reproject
from scipy.ndimage import median_filter

ZONES = {
    "valencia": {"files": "../data/raw/NISAR_L2_PR_GCOV_03[34]_*_20261023T*.h5 ../data/raw/NISAR_L2_PR_GCOV_03[34]_*_20261028T*.h5",
                 "bbox": (-0.65, 39.38, -0.32, 39.55)},
    "merja_zerga": {"files": "../data/raw/merja_zerga/*20261025T*.h5 ../data/raw/merja_zerga/*20261106T*.h5",
                    "bbox": (-6.36, 34.78, -6.20, 34.93)},
}


def read_crop(path, bbox, pol):
    """Read only the bbox from a NISAR GCOV file (frequency A). Returns dB image + coordinates + EPSG."""
    with h5py.File(path, "r") as nisar:
        grid = nisar["science/LSAR/GCOV/grids/frequencyA"]
        x, y = grid["xCoordinates"][:], grid["yCoordinates"][:]
        epsg = int(grid["projection"].attrs["epsg_code"])
        to_map = Transformer.from_crs("EPSG:4326", f"EPSG:{epsg}", always_xy=True)
        xs, ys = to_map.transform([bbox[0], bbox[2]] * 2, [bbox[1]] * 2 + [bbox[3]] * 2)
        cols = np.where((x >= min(xs)) & (x <= max(xs)))[0]
        rows = np.where((y >= min(ys)) & (y <= max(ys)))[0]
        power = grid[pol][rows[0]:rows[-1] + 1, cols[0]:cols[-1] + 1]
    db = 10 * np.log10(np.where(power > 0, power, np.nan))
    return db, x[cols[0]:cols[-1] + 1], y[rows[0]:rows[-1] + 1], epsg


def despeckle(img, size=3):
    """Light median filter (3x3) keeps details sharper than the 5x5 used for analysis."""
    empty = np.isnan(img)
    smooth = median_filter(np.where(empty, np.nanmedian(img), img), size=size)
    smooth[empty] = np.nan
    return smooth


def reproject_to_latlon(img, x, y, epsg):
    pixel = abs(x[1] - x[0])
    height, width = img.shape
    left, top = x[0] - pixel / 2, y[0] + pixel / 2
    right, bottom = left + width * pixel, top - height * pixel
    dst_transform, dst_w, dst_h = calculate_default_transform(f"EPSG:{epsg}", "EPSG:4326", width, height, left, bottom, right, top)
    out = np.full((dst_h, dst_w), np.nan, dtype="float32")
    reproject(source=img.astype("float32"), destination=out,
              src_transform=from_origin(left, top, pixel, pixel), src_crs=f"EPSG:{epsg}",
              dst_transform=dst_transform, dst_crs="EPSG:4326",
              src_nodata=np.nan, dst_nodata=np.nan, resampling=Resampling.bilinear)
    return out


def stretch(channel, low, high):
    return np.clip((channel - low) / (high - low), 0, 1)


def export_zone(zone, out_root):
    cfg = ZONES[zone]
    paths = [sorted(glob.glob(pattern))[0] for pattern in cfg["files"].split()]
    layers = {}
    for role, path in zip(["before", "after"], paths):
        hh, x, y, epsg = read_crop(path, cfg["bbox"], "HHHH")
        hv, _, _, _ = read_crop(path, cfg["bbox"], "HVHV")
        hh, hv = despeckle(hh), despeckle(hv)
        layers[role] = [reproject_to_latlon(band, x, y, epsg) for band in (hh, hv, hh - hv)]

    # Same stretch for BEFORE and AFTER (2nd-98th percentile of both) = fair visual comparison
    limits = []
    for band in range(3):
        values = np.concatenate([layers[r][band][np.isfinite(layers[r][band])] for r in ("before", "after")])
        limits.append(np.percentile(values, [2, 98]))

    for role in ("before", "after"):
        bands = layers[role]
        if COLOR:
            rgb = np.dstack([stretch(np.nan_to_num(b, nan=lo), lo, hi) for b, (lo, hi) in zip(bands, limits)])
        else:   # grayscale HH: dark = water, bright = buildings (easiest to read)
            lo, hi = limits[0]
            gray = stretch(np.nan_to_num(bands[0], nan=lo), lo, hi)
            rgb = np.dstack([gray, gray, gray])
        rgb = (rgb ** 0.8 * 255).astype("uint8")                       # slight gamma: brighter mid-tones
        alpha = np.where(np.isnan(bands[0]), 0, 255).astype("uint8")
        Image.fromarray(np.dstack([rgb, alpha])).save(f"{out_root}/{zone}/{role}.png")
        print(f"{zone}/{role}.png", rgb.shape[:2])


COLOR = "--color" in sys.argv     # default: clear grayscale HH; --color: false color HH / HV / HH-HV

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    out_root = args[0] if args else "../public/data"
    for zone in ZONES:
        export_zone(zone, out_root)
