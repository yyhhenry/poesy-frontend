# Interface

```txt
[Module] User
POST /api/user/register 注册
POST /api/user/login 登录
POST /api/user/logout 登出
POST /api/user/verify 验证
POST /api/user/exist?email={email} 判断用户是否存在
GET  /api/user/info 获取用户信息

[Module] Question
POST /api/question/upload 上传问题
GET  /api/question/{id} 获取问题
POST /api/question/by-user?email={email} 获取用户的问题
GET  /api/question/latest 获取最新问题

[Module] Answer
POST /api/answer/upload 上传回答
GET  /api/answer/by-question/{questionId} 获取问题的回答

[Module] Article
POST /api/article/upload 上传文章
GET  /api/article/{id} 获取文章
POST /api/article/by-user?email={email} 获取用户的文章
POST /api/article-comment/upload 上传文章评论
GET  /api/article-comment/by-article/{articleId} 获取文章的评论

[Module] Image
POST /api/image/upload 上传图片
GET  /api/image/{id} 获取图片

[Module] Qwen
POST /api/qwen/answer 询问Qwen2 大模型
```
