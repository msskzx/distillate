document.querySelectorAll('[data-answer]').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = button.closest('.quiz').querySelector('.quiz-answer')
    answer.classList.add('visible')
  })
})
