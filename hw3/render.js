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
  
      h2 {
        font-size: 1.2em;
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
  
      #posts li:last-child {
        border-bottom: none;
      }
  
      textarea {
        width: 500px;
        height: 300px;
      }
  
      input[type=text],
      textarea {
        border: 1px solid #eee;
        border-top-color: #ddd;
        border-left-color: #ddd;
        border-radius: 2px;
        padding: 15px;
        font-size: .8em;
      }
  
      input[type=text] {
        width: 500px;
      }
    </style>
  </head>
  <body>
    <section id="content">
      ${content}
    </section>
  </body>
  </html>
  `;
}

export function list(posts, currentPage, totalPages) {
  const list = posts.map(post => `
    <li>
      <h2>${post.title}</h2>
      <p><a href="/post/${post.id}">Read post</a></p>
    </li>
  `).join('\n');

  const pagination = `
    <div>
      ${currentPage > 1 ? `<a href="/page/${currentPage - 1}">Previous</a>` : ''}
      Page ${currentPage} of ${totalPages}
      ${currentPage < totalPages ? `<a href="/page/${currentPage + 1}">Next</a>` : ''}
    </div>
  `;

  const content = `
  <h1>Posts</h1>
  <p>You have <strong>${posts.length}</strong> posts!</p>
  <p><a href="/post/new">Create a Post</a></p>
  <ul id="posts">
    ${list}
  </ul>
  ${pagination}
  `;
  return layout('Posts', content);
}

export function newPost() {
  return layout('New Post', `
  <h1>New Post</h1>
  <p>Create a new post.</p>
  <form action="/post" method="post">
    <p><input type="text" placeholder="Title" name="title"></p>
    <p><textarea placeholder="Contents" name="body"></textarea></p>
    <p><input type="submit" value="Create"></p>
  </form>
  `);
}

export function show(post) {
  return layout(post.title, `
    <h1>${post.title}</h1>
    <p>${post.body}</p>
  `);
}