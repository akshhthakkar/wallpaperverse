// NAVIGATION SCROLL
const nav = document.getElementById("mainNav");
window.addEventListener("scroll", () => {
  if (window.pageYOffset > 100) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// SMOOTH SCROLLING
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#" && href !== "") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        });
      }
    }
  });
});

// BACK TO TOP
const backToTopBtn = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (window.pageYOffset > 500) {
    backToTopBtn.classList.add("visible");
  } else {
    backToTopBtn.classList.remove("visible");
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// INTERSECTION OBSERVER FOR COLLECTIONS
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".collection-card").forEach((card) => {
  observer.observe(card);
});

// AUTO-SCROLL COLLECTIONS
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll(".collection-card").forEach((card, index) => {
    const grid = card.querySelector(".collection-grid");
    const wrapper = card.querySelector(".collection-wrapper");
    const prevBtn = wrapper ? wrapper.querySelector(".nav-prev") : null;
    const nextBtn = wrapper ? wrapper.querySelector(".nav-next") : null;

    if (!grid) return;

    // Get original item count (before cloning)
    const items = Array.from(grid.children);
    const itemCount = items.length;
    const shouldAutoScroll = itemCount > 3;

    // Only clone items for infinite scroll if collection has more than 3 items
    if (shouldAutoScroll) {
      items.forEach(item => {
        const clone = item.cloneNode(true);
        grid.appendChild(clone);
      });
    }

    let scrollSpeed = 1.5;
    let isPaused = false;
    let isAutoScrolling = shouldAutoScroll;

    function autoScroll() {
      if (!isPaused && isAutoScrolling) {
        grid.scrollLeft += scrollSpeed;

          // Reset to beginning for seamless loop
        if (grid.scrollLeft >= grid.scrollWidth / 2) {
          grid.scrollLeft = 0;
        }
      }
      requestAnimationFrame(autoScroll);
    }

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        isPaused = true;
        const scrollAmount = 532; // 500px item + 32px gap
        grid.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
        // Resume auto-scroll from current position after scroll completes
        setTimeout(() => {
          isPaused = false;
        }, 500);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        isPaused = true;
        const scrollAmount = 532; // 500px item + 32px gap
        grid.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
        // Resume auto-scroll from current position after scroll completes
        setTimeout(() => {
          isPaused = false;
        }, 500);
      });
    }

    // Start auto-scroll only for collections with more than 3 items
    if (shouldAutoScroll) {
      autoScroll();
    }
  });
});

// DOWNLOAD FUNCTIONS
const collections = {
  anime: ["demon-slayer-zenitsu-yellow-lightning-wallpaper.jpg", "demon-slayer-zenitsu-thunder-breathing-wallpaper.jpg", "demon-slayer-tanjiro-kamado-wallpaper.jpg", "demon-slayer-gyomei-stone-hashira-wallpaper.jpg", "Lamborghini Miura.jpg", "demon-slayer-obanai-serpent-hashira-wallpaper.jpg", "demon-slayer-akaza-upper-moon-wallpaper.jpg", "jujutsu-kaisen-sukuna-king-of-curses-wallpaper.jpg", "jujutsu-kaisen-sukuna-domain-expansion-wallpaper.jpg", "jujutsu-kaisen-itadori-action-pose-wallpaper.jpg", "jujutsu-kaisen-yuji-itadori-protagonist-wallpaper.jpg", "jujutsu-kaisen-yuta-okkotsu-special-grade-wallpaper.jpg", "jujutsu-kaisen-ensemble-cast-wallpaper.jpg"],
  marvel: ["marvel-thanos-mad-titan-wallpaper.jpg", "marvel-thor-god-of-thunder-wallpaper.jpg", "marvel-loki-god-of-mischief-wallpaper.jpg", "marvel-loki-asgardian-prince-wallpaper.jpg", "marvel-venom-symbiote-wallpaper.jpg", "marvel-spider-gwen-stacy-wallpaper.jpg", "marvel-aunt-may-parker-wallpaper.jpg"],
  strangerthings: ["tv-show-stranger-things-cast-wallpaper.jpg", "tv-show-stranger-things-upside-down-wallpaper.jpg", "tv-show-stranger-things-vecna-wallpaper.jpg", "tv-show-stranger-things-will-vecna-wallpaper.jpg", "marvel-steve-rogers-captain-america-wallpaper.jpg"],
  movies: ["movie-interstellar-space-exploration-wallpaper.jpg", "tv-show-breaking-bad-heisenberg-wallpaper.jpg"],
  cars: ["disney-lightning-mcqueen-cars-wallpaper.jpg"],
  transformers: ["disney-optimus-prime-transformers-wallpaper.jpg"],
  random: ["sneaker-jordan-lost-and-found-retro-wallpaper.jpg"],
};

async function downloadImage(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = imageUrl.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification("Downloaded!");
  } catch (error) {
    console.error("Download failed:", error);
    showNotification("Download failed!", "error");
  }
}

async function downloadCollection(collectionName) {
  const files = collections[collectionName];
  if (!files) {
    showNotification("Collection not found!", "error");
    return;
  }
  
  showNotification(`Preparing ${files.length} wallpapers...`, "info");
  
  try {
    const zip = new JSZip();
    const folder = zip.folder(collectionName);
    
    const promises = files.map(async (filename) => {
      const response = await fetch("./" + filename);
      const blob = await response.blob();
      folder.file(filename, blob);
    });
    
    await Promise.all(promises);
    
    showNotification("Creating ZIP...", "info");
    const content = await zip.generateAsync({ type: "blob" });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${collectionName}-wallpapers.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    showNotification("ZIP downloaded!");
  } catch (error) {
    console.error("Download failed:", error);
    showNotification("Download failed!", "error");
  }
}

function showNotification(message, type = "success") {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();
  
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 2rem;
    padding: 1rem 2rem;
    background: ${type === "error" ? "#FF0040" : type === "info" ? "#00D9FF" : "#FFD700"};
    color: #0d0d0d;
    font-family: "Bebas Neue", sans-serif;
    font-size: 1.2rem;
    letter-spacing: 0.05em;
    border-radius: 4px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
    animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
  `;
  
  if (!document.getElementById("notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// LIGHTBOX
function openLightbox(imageSrc, imageAlt) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
    animation: fadeIn 0.3s ease;
  `;
  
  const img = document.createElement("img");
  img.src = imageSrc;
  img.alt = imageAlt;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border: 4px solid #00D9FF;
    box-shadow: 0 20px 60px rgba(0, 217, 255, 0.5);
    cursor: default;
  `;
  
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  closeBtn.style.cssText = `
    position: absolute;
    top: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    background: #00D9FF;
    color: #0d0d0d;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 217, 255, 0.5);
  `;
  
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "#FF0040";
    closeBtn.style.transform = "scale(1.1) rotate(90deg)";
  });
  
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "#00D9FF";
    closeBtn.style.transform = "scale(1) rotate(0deg)";
  });
  
  const downloadBtn = document.createElement("button");
  downloadBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  downloadBtn.style.cssText = `
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    padding: 1.2rem 2.5rem;
    background: linear-gradient(135deg, #00D9FF, #FF0040);
    color: #0d0d0d;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: "Bebas Neue", sans-serif;
    font-size: 1.2rem;
    letter-spacing: 0.05em;
    clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(0, 217, 255, 0.4);
  `;
  
  downloadBtn.addEventListener("mouseenter", () => {
    downloadBtn.style.transform = "translateY(-5px) scale(1.05)";
    downloadBtn.style.boxShadow = "0 12px 30px rgba(0, 217, 255, 0.6)";
  });
  
  downloadBtn.addEventListener("mouseleave", () => {
    downloadBtn.style.transform = "translateY(0) scale(1)";
    downloadBtn.style.boxShadow = "0 8px 20px rgba(0, 217, 255, 0.4)";
  });
  
  downloadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    downloadImage(imageSrc);
  });
  
  lightbox.appendChild(img);
  lightbox.appendChild(closeBtn);
  lightbox.appendChild(downloadBtn);
  document.body.appendChild(lightbox);
  document.body.style.overflow = "hidden";
  
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  closeBtn.addEventListener("click", closeLightbox);
  
  function handleEscape(e) {
    if (e.key === "Escape") closeLightbox();
  }
  document.addEventListener("keydown", handleEscape);
  
  lightbox.cleanup = () => document.removeEventListener("keydown", handleEscape);
  
  function closeLightbox() {
    lightbox.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => {
      lightbox.remove();
      document.body.style.overflow = "";
      if (lightbox.cleanup) lightbox.cleanup();
    }, 300);
  }
}

console.log("⚡ EPIC WALLPAPERS - INITIALIZED ⚡");