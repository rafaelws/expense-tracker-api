import type { onResponseHookHandler } from "fastify";

const pad = (n: number, size = 2): string => {
  if (size === 3) {
    if (n < 10) return "00" + n;
    if (n < 100) return "0" + n;
  } else {
    if (n < 10) return "0" + n;
  }
  return "" + n;
};

// dd-MM-yyyy HH:mm:ss.l
const time = () => {
  const n = new Date();
  const date = `${pad(n.getDate())}-${pad(n.getMonth() + 1)}-${n.getFullYear()}`;
  const time = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}.${pad(n.getMilliseconds(), 3)}`;
  return `${date} ${time}`;
};

const httpDevLoggerHook: onResponseHookHandler = (req, reply) => {
  const { method, url } = req;
  const status = reply.statusCode;
  const ms = reply.elapsedTime.toFixed(2);

  let color = 32; // green
  if (status >= 500) {
    color = 31; // red
  } else if (status >= 400) {
    color = 33; // yellow
  } else if (status >= 300) {
    color = 36; // cyan
  }
  console.log(
    `[${time()}] \x1b[${color}m${status}\x1b[0m ${method} ${url} - ${ms} ms`,
  );
};

export default httpDevLoggerHook;
