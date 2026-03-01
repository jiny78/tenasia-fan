export interface Article {
  id: number;
  title_ko: string | null;
  title_en: string | null;
  summary_ko: string | null;
  summary_en: string | null;
  content_ko?: string | null;
  author: string | null;
  published_at: string | null;
  artist_name_ko: string | null;
  artist_name_en: string | null;
  hashtags_ko: string[];
  hashtags_en: string[];
  thumbnail_url: string | null;
  source_url: string | null;
  language: string | null;
  sentiment?: string | null;
  extra_images?: { url: string }[];
}

/** 갤러리 사진 단위 (기사 1개에서 여러 장 추출 가능) */
export interface Photo {
  url: string;
  article_id: number;
  title_ko: string | null;
  title_en: string | null;
  source_url: string | null;
}

export interface ArtistGroup {
  group_id: number;
  name_ko: string | null;
  name_en: string | null;
  roles: string[];
  started_on: string | null;
  ended_on: string | null;
}

export interface Artist {
  id: number;
  name_ko: string;
  name_en: string | null;
  stage_name_ko: string | null;
  stage_name_en: string | null;
  gender: string | null;
  birth_date: string | null;
  nationality_ko: string | null;
  nationality_en: string | null;
  mbti: string | null;
  blood_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bio_ko: string | null;
  bio_en: string | null;
  is_verified: boolean;
  global_priority: number | null;
  photo_url?: string | null;
  groups?: ArtistGroup[];
}

export interface GroupMember {
  artist_id: number;
  name_ko: string | null;
  name_en: string | null;
  stage_name_ko: string | null;
  stage_name_en: string | null;
  roles: string[];
  started_on: string | null;
  ended_on: string | null;
  is_sub_unit: boolean;
}

export interface Group {
  id: number;
  name_ko: string;
  name_en: string | null;
  gender: string | null;
  debut_date: string | null;
  label_ko: string | null;
  label_en: string | null;
  fandom_name_ko: string | null;
  fandom_name_en: string | null;
  activity_status: string | null;
  bio_ko: string | null;
  bio_en: string | null;
  is_verified: boolean;
  global_priority: number | null;
  photo_url?: string | null;
  members?: GroupMember[];
}

export interface SearchResult {
  query: string;
  articles: Article[];
  artists: Artist[];
  groups: Group[];
}
