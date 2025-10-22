const menuBtn = document.querySelector('.liquid-nav .menu-btn');
const slideMenu = document.getElementById('slideMenu');

menuBtn.addEventListener('click', () => {
  if(slideMenu.style.display === 'flex'){
    slideMenu.style.display = 'none';
  } else {
    slideMenu.style.display = 'flex';
  }
});
