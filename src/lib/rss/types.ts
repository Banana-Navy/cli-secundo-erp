export interface RSSArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  thumbnail?: string;
}

export interface RSSFeedConfig {
  name: string;
  url: string;
}
