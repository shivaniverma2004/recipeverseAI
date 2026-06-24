export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  ingredients: string[];
  preparation_steps: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  cuisine: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  author?: User;
  likes_count?: number;
  is_liked?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Profile extends User {
  recipes_count: number;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}
