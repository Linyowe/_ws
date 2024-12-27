export function layout(title, content) {
  return `
  <html>
  <head>
    <title>${title}</title>
    <style>
      body {
        padding: 80px;
        font: 16px Helvetica, Arial;
      }
      h1 {
        font-size: 2em;
      }
      #posts {
        margin: 0;
        padding: 0;
      }
      #posts li {
        margin: 40px 0;
        padding: 0;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        list-style: none;
      }
      textarea {
        width: 500px;
        height: 300px;
      }
      input[type=text], input[type=password], textarea {
        border: 1px solid #eee;
        border-radius: 2px;
        padding: 15px;
        font-size: .8em;
      }
    </style>
  </head>
  <body>
    <section id="content">
      ${content}
    </section>
  </body>
  </html>`;
}

export function loginUi() {
  return layout('Login', `
  <h1>Login</h1>
  <form action="/login" method="post">
    <p><input type="text" placeholder="username" name="username"></p>
    <p><input type="password" placeholder="password" name="password"></p>
    <p><input type="submit" value="Login"></p>
    <p>New user? <a href="/signup">Create an account</p>
  </form>`);
}

export function signupUi() {
  return layout('Signup', `
  <h1>Signup</h1>
  <form action="/signup" method="post">
    <p><input type="text" placeholder="username" name="username"></p>
    <p><input type="password" placeholder="password" name="password"></p>
    <p><input type="text" placeholder="email" name="email"></p>
    <p><input type="submit" value="Signup"></p>
  </form>`);
}

export function success() {
  return layout('Success', `
  <h1>Success!</h1>
  You may <a href="/">read all posts</a> or <a href="/login">log in</a> again.`);
}

export function fail() {
  return layout('Fail', `
  <h1>Fail!</h1>
  You may <a href="/">read all posts</a> or <a href="JavaScript:window.history.back()">go back</a>.`);
}

export function list(posts, user, category) {
  const postItems = posts.map(post => `
    <li>
      <h2>${post.title} -- by ${post.username}</h2>
      <p><a href="/post/${post.id}">Read post</a></p>
    </li>`).join('');

  const categories = ["All", "Technology", "Lifestyle", "Education"];
  const categoryOptions = categories.map(cat => `
    <option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>`).join('');

  const content = `
  <h1>Posts</h1>
  <p>${user ? `Welcome ${user.username}, you may <a href="/post/new">create a post</a> or <a href="/logout">logout</a>.` : '<a href="/login">Login</a> to create a post!'}</p>
  <p>Filter by category:
    <select id="categoryFilter" onchange="window.location.href='/?category='+this.value">
      ${categoryOptions}
    </select>
  </p>
  <p>There are <strong>${posts.length}</strong> posts!</p>
  <ul id="posts">${postItems}</ul>`;

  return layout('Posts', content);
}

export function newPost() {
  return layout('New Post', `
  <h1>New Post</h1>
  <form action="/post" method="post">
    <p><input type="text" placeholder="Title" name="title"></p>
    <p><textarea placeholder="Contents" name="body"></textarea></p>
    <p><select name="category">
      <option value="Technology">Technology</option>
      <option value="Lifestyle">Lifestyle</option>
      <option value="Education">Education</option>
    </select></p>
    <p><input type="submit" value="Create"></p>
  </form>`);
}

export function show(post) {
  return layout(post.title, `
    <h1>${post.title} -- by ${post.username}</h1>
    <p>Category: ${post.category}</p>
    <p>${post.body}</p>`);
}
