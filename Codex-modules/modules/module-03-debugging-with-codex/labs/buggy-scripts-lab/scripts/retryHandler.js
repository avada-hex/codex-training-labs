const maxRetries = Math.max(1, Number(process.argv[2]) || 3);
const windows = new Array(maxRetries).fill(1000);
console.log("Retry windows:", windows);
