export interface UserResponse {
  userId: number;
  userEmail: string;
  userImageUrl: string;
  userNickname: string;
  userRepo?: string;
}

// 성공 응답 타입
export interface CreateRepo {
  repoName: string;
}
