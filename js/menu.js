// Otevření/zavření menu na mobilu (tlačítko ☰)
document.addEventListener('DOMContentLoaded', function () {
  var tlacitko = document.querySelector('.hamburger');
  var menu = document.querySelector('nav');
  if (tlacitko && menu) {
    tlacitko.addEventListener('click', function () {
      menu.classList.toggle('otevreno');
    });
  }
});