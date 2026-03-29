document.addEventListener('DOMContentLoaded', () => {
    const aboutModal = document.getElementById('aboutModal');
    const openButtons = document.querySelectorAll('[data-modal="about"]');
    const closeButton = aboutModal?.querySelector('.about-modal__close');
    const overlay = aboutModal?.querySelector('.about-modal__overlay');

    // Открытие модального окна
    function openModal() {
        if (aboutModal) {
            aboutModal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
    }

    // Закрытие модального окна
    function closeModal() {
        if (aboutModal) {
            aboutModal.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    }

    // Добавляем обработчики на кнопки
    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    // Закрытие по кнопке
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Закрытие по оверлею
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal?.classList.contains('is-open')) {
            closeModal();
        }
    });
});