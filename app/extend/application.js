'use strict';

module.exports = {
  generateJWT(id, username) {
    const { config } = this;
    const token = this.jwt.sign({ id, username }, config.jwt.secret);
    return token;
  },
  verifyToken(ctx) {
    const { config } = this;
    const token = config.jwt.getToken(ctx);
    if (!token) return null;
    return this.jwt.verify(token, config.jwt.secret);
  },
  getProfileJson(user) {
    return {
      username: user.username,
      bio: user.bio || null,
      image: user.image || null,
      following: user.following,
    };
  },
  getArticleJson(article, userId) {
    article = article.get({ plain: true });
    article.author.following = article.author.follows.some(follow => follow.followerId === userId);
    delete article.author.follows;
    const tagList = [];
    article.tagList.forEach(tag => tag && tagList.push(tag.name));
    article.tagList = tagList;
    article.favoritesCount = article.favorites.length;
    article.favorited = article.favorites.some(favorite => favorite.userId === userId);
    delete article.favorites;
    return article;
  },
  getUserJson(user, ctx) {
    user = user.get();
    const { config } = this;
    let token = config.jwt.getToken(ctx);
    if (!token) {
      token = this.generateJWT(user.id, user.username);
    }
    return {
      username: user.username,
      token,
      email: user.email,
      bio: user.bio || null,
      image: user.image || null,
    };
  },
};
