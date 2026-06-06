export interface SearchResultItem {
  id: string;
  type: "doctor" | "article" | "department";
  title: string;
  subtitle?: string;
  thumbnail?: string;
  url: string;
  publishedAt?: string;
}

export interface SearchResponse {
  doctors: SearchResultItem[];
  departments: SearchResultItem[];
  articles: SearchResultItem[];
  query: string;
  page: number;
  pageSize: number;
  totalDoctors: number;
  totalArticles: number;
  totalDepartments: number;
}

export interface SearchSuggestItem {
  text: string;
  type: string;
  url: string;
}
