// journal.js - Handles journal entry interactivity

document.addEventListener('DOMContentLoaded', () => {
    // Week date display
    const week3DateElement = document.getElementById('week3-date');
    if (week3DateElement) {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        week3DateElement.textContent = now.toLocaleDateString(undefined, options);
    }

    // Journal Card Toggle Logic
    const toggleButtons = document.querySelectorAll('.journal-toggle');
    const journalCards = document.querySelectorAll('.journal-card');

    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event from firing if we add one later
            const card = button.closest('.journal-card');

            // Toggle current card
            card.classList.toggle('active');

            // Optional: Close other cards when one is opened (Accordion style)
            // journalCards.forEach(c => {
            //     if (c !== card) c.classList.remove('active');
            // });

            // Rotate icon based on state
            const icon = button.querySelector('i');
            if (card.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });

    // Make entire header clickable for better UX
    const journalHeaders = document.querySelectorAll('.journal-header');
    journalHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.journal-card');
            if (card) {
                const toggleBtn = card.querySelector('.journal-toggle');
                if (toggleBtn) toggleBtn.click();
            }
        });
    });
});
