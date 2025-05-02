import { InternalAxiosRequestConfig } from "axios";

export interface ApiRequestConfig extends InternalAxiosRequestConfig {
  bypassInterceptor?: boolean;
  _retry?: boolean;
}

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";
export type ConditionalData<M extends HttpMethod, D> = M extends
  | "get"
  | "delete"
  ? undefined
  : D;

export interface ApiErrorResponse {
  httpStatus: number; // ErrorCode에서 받은 HTTP 상태 코드
  code: string; // ErrorCode에서 받은 에러 코드
  message: string; // ErrorCode에서 받은 메시지
}
