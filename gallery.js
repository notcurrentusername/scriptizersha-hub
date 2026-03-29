document.addEventListener('DOMContentLoaded', () => {
    // Фильтрация
    const filters = document.querySelectorAll('.gallery-filter');
    const items = document.querySelectorAll('.gallery-item');
    
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Активный класс
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            const filterValue = filter.getAttribute('data-filter');
            
            items.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox__image');
    const lightboxTitle = document.querySelector('.lightbox__title');
    const lightboxCategory = document.querySelector('.lightbox__category');
    const closeBtn = document.querySelector('.lightbox__close');
    const prevBtn = document.querySelector('.lightbox__prev');
    const nextBtn = document.querySelector('.lightbox__next');
    
    let currentIndex = 0;
    let visibleItems = Array.from(document.querySelectorAll('.gallery-item'));
    
    // Открытие lightbox
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            const img = item.querySelector('.gallery-item__image');
            const title = item.querySelector('.gallery-item__title');
            const category = item.querySelector('.gallery-item__category');
            
            currentIndex = visibleItems.indexOf(item);
            
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
            lightboxTitle.textContent = title.textContent;
            lightboxCategory.textContent = category.textContent;
            
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Закрытие
    function closeLightbox() {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
    }
    
    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Переключение фото
    function showImage(index) {
        const item = visibleItems[index];
        const img = item.querySelector('.gallery-item__image');
        const title = item.querySelector('.gallery-item__title');
        const category = item.querySelector('.gallery-item__category');
        
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxTitle.textContent = title.textContent;
        lightboxCategory.textContent = category.textContent;
    }
    
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        showImage(currentIndex);
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % visibleItems.length;
        showImage(currentIndex);
    });
    
    // Клавиши
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
            showImage(currentIndex);
        }
        if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % visibleItems.length;
            showImage(currentIndex);
        }
    });
    
    // Обновление visibleItems при фильтрации
    const observer = new MutationObserver(() => {
        visibleItems = Array.from(document.querySelectorAll('.gallery-item')).filter(
            item => item.style.display !== 'none'
        );
    });
    
    observer.observe(document.querySelector('.gallery-grid'), {
        childList: true,
        attributes: true,
        subtree: true
    });
});