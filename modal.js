// Модальное окно
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('supportModal');
    const openButtons = document.querySelectorAll('[data-modal="support"]');
    const closeButton = modal?.querySelector('.modal__close');
    const overlay = modal?.querySelector('.modal__overlay');

    // Открытие модального окна
    function openModal() {
        if (modal) {
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
    }

    // Закрытие модального окна
    function closeModal() {
        if (modal) {
            modal.classList.remove('is-open');
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
        if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
            closeModal();
        }
    });
});