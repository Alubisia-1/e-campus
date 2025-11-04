// Cleanup script to remove localStorage mock data
console.log('Cleaning up localStorage mock data...');

// Remove all mock data from localStorage
const itemsToRemove = [
  'officialStoreItems',
  'nativeAds',
  'products',
  'items'
];

itemsToRemove.forEach(item => {
  if (localStorage.getItem(item)) {
    localStorage.removeItem(item);
    console.log(`Removed: ${item}`);
  }
});

console.log('Cleanup complete!');
console.log('Please refresh the page to see changes.');
