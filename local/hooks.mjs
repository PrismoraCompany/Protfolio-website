// Lets the Worker's `import('cloudflare:sockets')` work in plain Node.js (Termux, laptop...).
export async function resolve(spec, ctx, next) {
  if (spec === 'cloudflare:sockets') return { url: new URL('./sockets.mjs', import.meta.url).href, shortCircuit: true };
  return next(spec, ctx);
}
