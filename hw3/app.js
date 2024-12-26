import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");
db.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT
  )
`);

const router = new Router();

router.get('/', list)
  .get('/page/:page', list)
  .get('/post/new', add)
  .get('/post/:id', show)
  .post('/post', create);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

function query(sql, params = []) {
  const list = [];
  for (const [id, title, body] of db.query(sql, params)) {
    list.push({ id, title, body });
  }
  return list;
}

async function list(ctx) {
  const perPage = 5; 
  const page = parseInt(ctx.params.page) || 1;
  const offset = (page - 1) * perPage;

  const posts = query("SELECT id, title, body FROM posts ORDER BY id DESC LIMIT ? OFFSET ?", [perPage, offset]);
  const totalPosts = db.query("SELECT COUNT(*) FROM posts")[0][0];
  const totalPages = Math.ceil(totalPosts / perPage);

  console.log(`list: page=${page}, posts=`, posts);
  ctx.response.body = await render.list(posts, page, totalPages);
}

async function add(ctx) {
  ctx.response.body = await render.newPost();
}

async function show(ctx) {
  const pid = ctx.params.id;
  const posts = query("SELECT id, title, body FROM posts WHERE id = ?", [pid]);
  const post = posts[0];
  console.log('show: post=', post);
  if (!post) ctx.throw(404, 'Invalid post ID');
  ctx.response.body = await render.show(post);
}

async function create(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    const pairs = await body.value;
    const post = {};
    for (const [key, value] of pairs) {
      post[key] = value;
    }
    console.log('create: post=', post);
    db.query("INSERT INTO posts (title, body) VALUES (?, ?)", [post.title, post.body]);
    ctx.response.redirect('/');
  }
}

let port = parseInt(Deno.args[0]) || 8000;
console.log(`Server running at http://127.0.0.1:${port}`);
await app.listen({ port });
