import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";

export const config = {
  runtime: "edge",
};

const app = new Hono();

// 配置 CORS 中间件
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "HEAD", "POST", "OPTIONS"],
    maxAge: 86400,
  })
);

// 处理所有请求的路由
app.all("*", async (c) => {
  const { method, url } = c.req;
  // 修复：通过 raw 获取原始请求对象的 headers
  const headers = Object.fromEntries(c.req.raw.headers.entries());

  let body = null;
  if (method === "POST") {
    body = await c.req.json().catch(() => null);
  }

  const responseBody = {
    url,
    method,
    body,
    clientIP: c.req.header("x-real-ip"),
    headers,
  };

  return c.json(responseBody, 200);
});

export default handle(app);
