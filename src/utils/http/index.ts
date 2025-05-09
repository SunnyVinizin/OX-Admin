import Axios, {
  type AxiosError,
  type AxiosResponse,
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {RequestMethods, PureHttpRequestConfig} from "./types.d";
import {stringify} from "qs";
import NProgress from "../progress";
import {getToken, formatToken} from "@/utils/auth";
import {useUserStoreHook} from "@/store/modules/user";
import {message} from "../message";
import router from "@/router";

interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

// 扩展 AxiosResponse 类型
interface CustomResponse<T = any> extends AxiosResponse {
  data: ResponseData<T>;
}

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 基础URL
  baseURL: import.meta.env.VITE_API_URL,
  // 请求超时时间
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  },
  // 跨域请求时是否需要使用凭证
  withCredentials: true
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** `token`过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新`token` */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        NProgress.start();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        /** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
        const whiteList = ["/refresh-token", "/login"];
        return whiteList.some(url => config.url.endsWith(url))
          ? config
          : new Promise(resolve => {
              const data = getToken();
              if (data) {
                const now = new Date().getTime();
                const expired = parseInt(data.expires) - now <= 0;
                if (expired) {
                  if (!PureHttp.isRefreshing) {
                    PureHttp.isRefreshing = true;
                    // token过期刷新
                    useUserStoreHook()
                      .handRefreshToken({refreshToken: data.refreshToken})
                      .then(res => {
                        const token = res.data.accessToken;
                        config.headers["Authorization"] = formatToken(token);
                        PureHttp.requests.forEach(cb => cb(token));
                        PureHttp.requests = [];
                      })
                      .finally(() => {
                        PureHttp.isRefreshing = false;
                      });
                  }
                  resolve(PureHttp.retryOriginalRequest(config));
                } else {
                  config.headers["Authorization"] = formatToken(
                    data.accessToken
                  );
                  resolve(config);
                }
              } else {
                resolve(config);
              }
            });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: CustomResponse) => {
        // const $config = response.config;
        // 关闭进度条动画
        NProgress.done();

        // 处理业务状态码
        const {code, message: msg, data} = response.data;
        if (code === 200) {
          return {
            success: true,
            data: data
          };
        } else {
          // 统一处理业务错误
          message(msg || "操作失败", {type: "error"});
          return {
            success: false,
            data: null
          } as any;
        }
      },
      (error: AxiosError<ResponseData>) => {
        const $error = error;
        // 关闭进度条动画
        NProgress.done();

        // 处理 HTTP 错误
        if (error.response) {
          switch (error.response.status) {
            case 401:
              message(
                error.response.data?.message || "登录已过期，请重新登录",
                {
                  type: "error"
                }
              );
              // 可以在这里处理登出逻辑
              useUserStoreHook().logOut();
              router.push("/login");
              break;
            case 403:
              message(error.response.data?.message || "没有权限访问", {
                type: "error"
              });
              break;
            case 404:
              message(error.response.data?.message || "请求的资源不存在", {
                type: "error"
              });
              break;
            case 500:
              message(error.response.data?.message || "服务器错误", {
                type: "error"
              });
              break;
            default:
              message(error.response.data?.message || "请求失败", {
                type: "error"
              });
          }
        } else if (error.request) {
          // 请求已发出但未收到响应
          message(error.response.data?.message || "网络连接失败", {
            type: "error"
          });
        } else {
          // 请求配置发生错误
          message(error.message || "请求错误", {type: "error"});
        }

        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** 单独抽离的`post`工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new PureHttp();
