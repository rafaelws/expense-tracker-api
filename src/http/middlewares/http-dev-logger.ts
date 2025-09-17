import type { onResponseHookHandler } from "fastify";

const padLeft = (n: number) => (n < 10 ? "0" + n : n);

// dd-MM-yyyy HH:mm:ss
const time = () => {
  const n = new Date();
  const date = `${padLeft(n.getDate())}-${padLeft(n.getMonth() + 1)}-${n.getFullYear()}`;
  const time = `${padLeft(n.getHours())}:${padLeft(n.getMinutes())}:${padLeft(n.getSeconds())}`;
  return `${date} ${time}`;
};

const httpDevLoggerHook: onResponseHookHandler = (req, reply) => {
  const { method, url } = req;
  const status = reply.statusCode;
  const ms = reply.elapsedTime.toFixed(2);

  let color = 32; // verde
  if (status >= 500) {
    color = 31; // vermelho;
  } else if (status >= 400) {
    color = 33; // amarelo
  } else if (status >= 300) {
    color = 36; // ciano
  }
  console.log(
    `[${time()}] \x1b[${color}m${status}\x1b[0m ${method} ${url} - ${ms} ms`,
  );
};

export default httpDevLoggerHook;
