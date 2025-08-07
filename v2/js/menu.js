// Add the missing move function
function move(id, position, color) {
  // Get the bubble and menu elements
  const bubble = document.getElementById('bubble' + id);
  const menu = document.getElementById('menu' + id);
  
  // Update the bubble position and color
  if (bubble) {
    bubble.style.left = position;
    bubble.style.backgroundColor = color;
  }
  
  // Update active state for menu items
  const menuElements = document.querySelectorAll('.menuElement');
  menuElements.forEach(el => {
    el.classList.remove('active');
  });
  
  if (menu) {
    menu.classList.add('active');
  }
}