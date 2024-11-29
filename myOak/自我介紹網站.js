import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

router
  .get("/", (context) => {
    context.response.body = `
      <h1>歡迎來到 Oak 自我介紹服務</h1>
      <p>這是一個用 Oak 框架建立的服務，提供自我介紹的 API。</p>
      <p>試試看 <a href="/intro">/intro</a> 路徑！</p>
    `;
  })
  .get("/intro", (context) => {
    const introduction = {
      name: "Oak Service",
      purpose: "一個基於 Deno 和 Oak 框架的簡單服務。",
      features: [
        "快速和輕量的 HTTP 服務",
        "使用 TypeScript 開發",
        "適合學習和快速構建應用程式",
      ],
      message: "很高興認識你！",
    };

    context.response.body = introduction;
  });

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 8000;
console.log(`服務正在 http://localhost:${PORT} 上運行...`);
await app.listen({ port: PORT });
