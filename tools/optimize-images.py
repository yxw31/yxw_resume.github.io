"""Generate web-optimized WebP copies of the portfolio's raster images.

The original files are intentionally retained as source assets. Runtime JSON
points to the generated WebP files so the site transfers substantially fewer
bytes without making future re-encoding destructive.
"""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "images"
SOURCE_SUFFIXES = {".jpg", ".jpeg", ".png"}


def profile_for(path: Path) -> tuple[int, int]:
    relative = path.relative_to(IMAGE_ROOT).as_posix()
    if relative.startswith("hero/"):
        return 1600, 83
    if relative == "daily_life/all1.jpg":
        return 1920, 82
    if relative.startswith("daily_life/"):
        return 1440, 81
    if relative.startswith("home_page/"):
        return 900, 84
    if relative.startswith("activities/"):
        return 1920, 82
    if relative.startswith("projects/"):
        return 1920, 88
    return 1600, 83


def optimize(source: Path) -> tuple[Path, int, int]:
    max_edge, quality = profile_for(source)
    destination = source.with_suffix(".webp")
    source_bytes = source.stat().st_size

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)

        if image.mode in {"RGBA", "LA"} or "transparency" in image.info:
            output = image.convert("RGBA")
        else:
            output = image.convert("RGB")

        output.save(
            destination,
            "WEBP",
            quality=quality,
            method=6,
            optimize=True,
        )

    return destination, source_bytes, destination.stat().st_size


def main() -> None:
    sources = sorted(
        path
        for path in IMAGE_ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in SOURCE_SUFFIXES
    )

    total_before = 0
    total_after = 0
    for source in sources:
        destination, before, after = optimize(source)
        total_before += before
        total_after += after
        ratio = (1 - after / before) * 100 if before else 0
        print(
            f"{source.relative_to(ROOT)} -> {destination.relative_to(ROOT)} "
            f"({before / 1024:.0f} KB -> {after / 1024:.0f} KB, -{ratio:.0f}%)"
        )

    print(
        f"TOTAL: {total_before / 1048576:.2f} MB -> "
        f"{total_after / 1048576:.2f} MB "
        f"(-{(1 - total_after / total_before) * 100:.1f}%)"
    )


if __name__ == "__main__":
    main()
