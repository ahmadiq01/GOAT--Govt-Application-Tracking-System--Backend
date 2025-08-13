/**
 * Utility function to generate tracking numbers in the same format as the backend
 * This can be used by the frontend to generate tracking numbers before submitting applications
 */

const generateTrackingNumber = () => {
  const ts = Math.floor(Date.now() / 1000);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `GOAT-${ts}-${rand}`;
};

module.exports = {
  generateTrackingNumber
};
