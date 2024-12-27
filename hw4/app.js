import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

const db = new DB("blog.db");
db.query(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT UNIQUE
)`);
db.query(`CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  username TEXT, 
  category_id INTEGER, 
  title TEXT, 
  body TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
)`);
db.query(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  username TEXT, 
  password TEXT, 
  email TEXT
)`);

const router = new Router();

router
  .get('/', list)
  .get('/signup', signupUi)
  .post('/signup', signup)
  .get('/login', loginUi)
  .post('/login', login)
  .get('/logout', logout)
  .get('/post/new', addPostUi)
  .post('/post', createPost)
  .get('/post/:id', showPost)
  .get('/categories', listCategories)
  .get('/category/new', addCategoryUi)
  .post('/category', createCategory)
  .get('/category/:id', listCategoryPosts);

const app = new Application();
app.use(Session.initMiddleware());
app.use(router.routes());
app.use(router.allowedMethods());

function query(sql, params = []) {
  return [...db.query(sql, params)];
}

async function parseFormBody(body) {
  const pairs = await body.form();
  const result = {};
  for (const [key, value] of pairs) {
    result[key] = value;
  }
  return result;
}

async function list(ctx) {
  const posts = query(`
    SELECT posts.id, posts.username, posts.title, categories.name as category
    FROM posts
    LEFT JOIN categories ON posts.category_id = categories.id
  `);
  const user = await ctx.state.session.get('user');
  ctx.response.body = render.list(posts, user);
}

async function signupUi(ctx) {
  ctx.response.body = render.signupUi();
}

async function signup(ctx) {
  const form = await parseFormBody(ctx.request.body());
  const existingUsers = query("SELECT * FROM users WHERE username = ?", [form.username]);

  if (existingUsers.length > 0) {
    ctx.response.body = render.fail("Username already exists.");
    return;
  }

  db.query("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [form.username, form.password, form.email]);
  ctx.response.body = render.success("Signup successful. Please log in.");
}

async function loginUi(ctx) {
  ctx.response.body = render.loginUi();
}

async function login(ctx) {
  const form = await parseFormBody(ctx.request.body());
  const users = query("SELECT * FROM users WHERE username = ?", [form.username]);

  if (users.length === 0 || users[0][2] !== form.password) {
    ctx.response.body = render.fail("Invalid username or password.");
    return;
  }

  await ctx.state.session.set('user', { username: form.username });
  ctx.response.redirect('/');
}

async function logout(ctx) {
  await ctx.state.session.set('user', null);
  ctx.response.redirect('/');
}

async function addPostUi(ctx) {
  const user = await ctx.state.session.get('user');
  if (!user) {
    ctx.response.body = render.fail("Please log in to create a post.");
    return;
  }

  const categories = query("SELECT * FROM categories");
  ctx.response.body = render.newPost(categories);
}

async function createPost(ctx) {
  const user = await ctx.state.session.get('user');
  if (!user) {
    ctx.response.body = render.fail("Please log in to create a post.");
    return;
  }

  const form = await parseFormBody(ctx.request.body());
  db.query(
    "INSERT INTO posts (username, category_id, title, body) VALUES (?, ?, ?, ?)",
    [user.username, form.category_id, form.title, form.body]
  );

  ctx.response.redirect('/');
}

async function showPost(ctx) {
  const postId = ctx.params.id;
  const posts = query(`
    SELECT posts.id, posts.username, posts.title, posts.body, categories.name as category
    FROM posts
    LEFT JOIN categories ON posts.category_id = categories.id
    WHERE posts.id = ?
  `, [postId]);

  if (posts.length === 0) {
    ctx.throw(404, "Post not found.");
    return;
  }

  ctx.response.body = render.showPost(posts[0]);
}

async function listCategories(ctx) {
  const categories = query("SELECT * FROM categories");
  ctx.response.body = render.listCategories(categories);
}

async function addCategoryUi(ctx) {
  ctx.response.body = render.newCategory();
}

async function createCategory(ctx) {
  const form = await parseFormBody(ctx.request.body());
  db.query("INSERT INTO categories (name) VALUES (?)", [form.name]);
  ctx.response.redirect('/categories');
}

async function listCategoryPosts(ctx) {
  const categoryId = ctx.params.id;
  const posts = query(`
    SELECT posts.id, posts.username, posts.title
    FROM posts
    WHERE posts.category_id = ?
  `, [categoryId]);

  ctx.response.body = render.list(posts, await ctx.state.session.get('user'));
}

console.log("Server running at http://127.0.0.1:8000");
await app.listen({ port: 8000 });
