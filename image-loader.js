// This is a no-op loader for static exports
// It simply returns the original src since we're using unoptimized images
module.exports = function customLoader({ src, width, quality }) {
  return `${src}?w=${width}&q=${quality || 75}`;
};
