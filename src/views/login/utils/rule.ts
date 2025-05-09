import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 密码正则（密码长度至少6位） */
export const REGEXP_PWD = /^.{6,}$/;

/** 登录校验 */
const loginRules = reactive(<FormRules>{
  password: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入密码"));
        } else if (!REGEXP_PWD.test(value)) {
          callback(
            new Error("密码长度至少6位")
          );
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

export { loginRules };
