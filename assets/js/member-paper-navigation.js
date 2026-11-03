(() => {
  // Keep the entry context in the URL so new tabs, reloads and adjacent papers
  // return to the same place without relying on browser history or shared state.
  if (new URLSearchParams(window.location.search).get('from') !== 'profile') return;

  const paper = document.querySelector('#member-paper');
  const back = paper?.querySelector('.mp-back-link');
  if (!back) return;

  back.href = back.dataset.profileUrl;
  back.querySelector('.mp-back-label').textContent = back.dataset.profileLabel;

  paper.querySelectorAll('.mp-adjacent-paper').forEach(link => {
    const url = new URL(link.href);
    url.searchParams.set('from', 'profile');
    link.href = url.href;
  });
})();
