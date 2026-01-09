/**
 * Wallpaper Automation Script
 * Run: node update-wallpapers.js
 *
 * This script:
 * 1. Scans image folders for wallpapers
 * 2. Updates wallpapers.json with new entries
 * 3. Regenerates sitemap.xml with all wallpaper URLs
 */

const fs = require("fs");
const path = require("path");

// Configuration
const CATEGORIES = {
  anime: "anime",
  marvel: "marvel",
  movies: "movies",
  cars: "cars",
  transformers: "transformers",
  random: "random",
};

const SITE_URL = "https://wallpaperverse.akshthakkar.me";
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Generate ID from filename
function generateId(filename) {
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, "")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

// Generate title from filename
function generateTitle(filename) {
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, "")
    .replace(/[-_]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Scan folder for images
function scanFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath)
    .filter((file) =>
      IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())
    )
    .map((file) => ({
      file,
      title: generateTitle(file),
      optimized: `optimized/${path.basename(folderPath)}/${file.replace(
        /\.(jpg|jpeg|png)$/i,
        ".webp"
      )}`,
      original: `${path.basename(folderPath)}/${file}`,
    }));
}

// Update wallpapers.json
function updateWallpapersJson() {
  const wallpapers = {};

  Object.keys(CATEGORIES).forEach((category) => {
    const folderPath = path.join(__dirname, category);
    const items = scanFolder(folderPath);
    if (items.length > 0) {
      wallpapers[category] = items;
    }
  });

  fs.writeFileSync(
    path.join(__dirname, "wallpapers.json"),
    JSON.stringify(wallpapers, null, 2)
  );

  console.log("✅ wallpapers.json updated");
  return wallpapers;
}

// Generate sitemap.xml
function generateSitemap(wallpapers) {
  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/submit</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;

  // Add wallpaper pages
  Object.entries(wallpapers).forEach(([category, items]) => {
    xml += `\n  <!-- ${
      category.charAt(0).toUpperCase() + category.slice(1)
    } Wallpapers -->\n`;
    items.forEach((item) => {
      const id = generateId(item.file);
      xml += `  <url>
    <loc>${SITE_URL}/wallpaper?id=${id}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
  </url>\n`;
    });
  });

  xml += "</urlset>\n";

  fs.writeFileSync(path.join(__dirname, "sitemap.xml"), xml);

  const totalWallpapers = Object.values(wallpapers).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  console.log(`✅ sitemap.xml updated (${totalWallpapers + 2} URLs)`);
}

// Main
console.log("🚀 Updating wallpapers and sitemap...\n");
const wallpapers = updateWallpapersJson();
generateSitemap(wallpapers);
console.log("\n✨ Done! Commit and push your changes.");
