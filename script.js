document.addEventListener("DOMContentLoaded", () => {
    const galleryContainer = document.getElementById("gallery");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("close-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    // 1. Source 8-10 placeholder images (optimized/lazy loaded implicitly by browser if needed, but we use fast placeholders)
    const images = Array.from({ length: 10 }, (_, i) => ({
        thumbnail: `https://picsum.photos/seed/port${i}/400/300`,
        full: `https://picsum.photos/seed/port${i}/1200/900`,
        alt: `Portfolio Project ${i + 1}`
    }));

    let currentIndex = 0;

    // 2. Build responsive grid gallery
    images.forEach((image, index) => {
        const item = document.createElement("div");
        item.classList.add("gallery-item");
        
        const img = document.createElement("img");
        img.src = image.thumbnail;
        img.alt = image.alt;
        img.loading = "lazy"; // Optimize for fast loading
        
        item.appendChild(img);
        
        // Open lightbox on click
        item.addEventListener("click", () => openLightbox(index));
        
        galleryContainer.appendChild(item);
    });

    // 3. Lightbox Logic
    function openLightbox(index) {
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent scrolling when open
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto";
        // Small delay to clear source after fade out
        setTimeout(() => { lightboxImg.src = ""; }, 300);
    }

    function updateLightboxImage() {
        lightboxImg.src = images[currentIndex].full;
        lightboxImg.alt = images[currentIndex].alt;
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightboxImage();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    // Event Listeners for Controls
    closeBtn.addEventListener("click", closeLightbox);
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showNext(); });
    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showPrev(); });
    
    // Close when clicking outside the image
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") showNext();
        if (e.key === "ArrowLeft") showPrev();
    });
});
