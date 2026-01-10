const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./optimized";
const outputDir = "./thumbnails";

// Tiny thumbnails for category picker collages
const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 225;
const THUMB_QUALITY = 60;

// Ensure root output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const createThumbnail = async (category, file) => {
  try {
    const categoryInputDir = path.join(inputDir, category);
    const categoryOutputDir = path.join(outputDir, category);

    // Create output category dir if missing
    if (!fs.existsSync(categoryOutputDir)) {
      fs.mkdirSync(categoryOutputDir);
    }

    const inputPath = path.join(categoryInputDir, file);
    const outputPath = path.join(categoryOutputDir, file);

    // Skip if it's not an image
    if (
      ![".jpg", ".jpeg", ".png", ".webp"].includes(
        path.extname(file).toLowerCase()
      )
    ) {
      return false;
    }

    // Skip if thumbnail already exists
    if (fs.existsSync(outputPath)) {
      return true;
    }

    await sharp(inputPath)
      .resize({
        width: THUMB_WIDTH,
        height: THUMB_HEIGHT,
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
      .toFile(outputPath);

    console.log(`✓ Created thumbnail: ${category}/${file}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
    return false;
  }
};

const main = async () => {
  console.log("Generating tiny thumbnails for category picker...");

  try {
    if (!fs.existsSync(inputDir)) {
      console.error(
        "Input directory 'optimized' not found! Run generate_wallpapers.js first."
      );
      return;
    }

    const categories = fs
      .readdirSync(inputDir)
      .filter((f) => fs.statSync(path.join(inputDir, f)).isDirectory());

    let totalCount = 0;

    for (const category of categories) {
      const files = fs.readdirSync(path.join(inputDir, category));

      for (const file of files) {
        const created = await createThumbnail(category, file);
        if (created) totalCount++;
      }
    }

    console.log(`\nDone! Created ${totalCount} thumbnails in ./thumbnails/`);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
};

main();
