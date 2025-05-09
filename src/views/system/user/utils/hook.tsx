import "./reset.css";
import roleForm from "../form/role.vue";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { message } from "@/utils/message";
import userAvatar from "@/assets/user.jpg";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps, RoleFormItemProps } from "../utils/types";
import { getKeyList, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import { deptTreeQuery } from "@/api/dept";
import { positionListQuery } from "@/api/position";
import {
  addUser,
  deleteUser,
  updateUser,
  updateUserPassword,
  updateUserRole,
  updateUserStatus,
  userListQuery
} from "@/api/user";
import { roleListQuery } from "@/api/role";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElMessageBox
} from "element-plus";
import { Phone, Message, Position } from "@element-plus/icons-vue";
import { type Ref, h, ref, watch, computed, reactive, onMounted } from "vue";
import { http } from "@/utils/http";

export function useUser(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    // 左侧部门树的id
    deptId: null,
    username: "",
    nickname: "",
    mobile: "",
    status: null
  });
  const formRef = ref();
  const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传头像信息
  const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const higherDeptOptions = ref();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "勾选列",
      type: "selection",
      fixed: "left",
      reserveSelection: true,
      width: 50
    },
    {
      label: "用户编号",
      prop: "id",
      width: 80,
      align: "center"
    },
    {
      label: "用户头像",
      prop: "avatar",
      width: 80,
      align: "center",
      cellRenderer: ({ row }) => (
        <el-avatar size={32} src={row.avatar} style="vertical-align: middle;" />
      )
    },
    {
      label: "用户信息",
      prop: "username",
      width: 180,
      cellRenderer: ({ row }) => (
        <div class="flex flex-col justify-center">
          <span class="font-medium mb-1">{row.username}</span>
          <span class="text-gray-500 text-sm">{row.nickname}</span>
        </div>
      )
    },
    {
      label: "联系方式",
      prop: "contact",
      width: 200,
      cellRenderer: ({ row }) => (
        <div class="flex flex-col justify-center">
          <span class="mb-1">
            <el-icon class="mr-1 text-gray-400"><Phone /></el-icon>
            {row.mobile || "-"}
          </span>
          <span>
            <el-icon class="mr-1 text-gray-400"><Message /></el-icon>
            {row.email || "-"}
          </span>
        </div>
      )
    },
    {
      label: "所属部门",
      prop: "departments",
      width: 150,
      cellRenderer: ({ row }) => (
        <el-tag size="small" effect="plain">
          {row.departments?.[0]?.deptName || "-"}
        </el-tag>
      )
    },
    {
      label: "岗位信息",
      prop: "positions",
      width: 220,
      align: "center",
      cellRenderer: ({ row }) => {
        const secondaryPositions = row.positions?.filter(p => p.id !== row.primaryPositionId) || [];

        return (
          <div class="flex flex-col justify-center items-center gap-1">
            {/* 主岗位 */}
            {row.primaryPosition ? (
              <el-tag type="success" effect="plain" class="flex items-center h-[24px]">
                <el-icon><Position /></el-icon>
                <span class="ml-1">{row.primaryPosition.positionName}</span>
              </el-tag>
            ) : (
              <el-tag type="info" effect="plain" class="h-[24px]">
                暂无岗位
              </el-tag>
            )}

            {/* 副岗位弹出框 */}
            {secondaryPositions.length > 0 && (
              <el-popover
                placement="top"
                trigger="click"
                width="auto"
                popper-class="!p-0"
                tabindex="0"
                role="dialog"
                aria-label="副岗位信息"
              >
                {{
                  reference: () => (
                    <el-button
                      link
                      type="primary"
                      class="text-xs"
                      role="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      查看{secondaryPositions.length}个副岗
                    </el-button>
                  ),
                  default: () => (
                    <div
                      class="min-w-[120px]"
                      role="list"
                      aria-label="副岗位列表"
                    >
                      {secondaryPositions.map((p, index) => (
                        <div
                          key={p.id}
                          role="listitem"
                          class={[
                            "py-2 px-3",
                            index !== secondaryPositions.length - 1 && "border-b border-gray-100"
                          ]}
                        >
                          {p.positionName}
                        </div>
                      ))}
                    </div>
                  )
                }}
              </el-popover>
            )}
          </div>
        );
      }
    },
    {
      label: "角色",
      prop: "roles",
      width: 150,
      align: "center",
      cellRenderer: ({ row }) => (
        <div class="flex flex-wrap gap-1 justify-center">
          {row.roles?.map(role => (
            <el-tag key={role.id} size="small" type="warning" effect="plain">
              {role.roleName}
            </el-tag>
          ))}
        </div>
      )
    },
    {
      label: "状态",
      prop: "status",
      width: 100,
      align: "center",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="启用"
          inactive-text="停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "创建时间",
      prop: "createdAt",
      width: 180,
      align: "center"
    },
    {
      label: "操作",
      fixed: "right",
      width: 160,
      align: "center",
      slot: "operation"
    }
  ];

  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });
  // 重置的新密码
  const pwdForm = reactive({
    newPwd: ""
  });
  const pwdProgress = [
    { color: "#e74242", text: "非常弱" },
    { color: "#EFBD47", text: "弱" },
    { color: "#ffa500", text: "一般" },
    { color: "#1bbf1b", text: "强" },
    { color: "#008000", text: "非常强" }
  ];
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);
  const positionOptions = ref([]);

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${row.username
      }</strong>用户吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        // 是的,这里的loading是指switch组件的loading状态
        // 设置对应索引的switch为加载状态
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );

        await updateUserStatus(row.id, row.status);
        message("已成功修改用户状态", {
          type: "success"
        });
        setTimeout(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
          onSearch();
        }, 300);
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  function handleUpdate(row) {
    console.log(row);
  }

  async function handleDelete(row) {
    await deleteUser(row.id);
    message(`删除成功`, {
      type: "success"
    });
    setTimeout(() => {
      onSearch(); // 刷新表格数据
    }, 300);
  }
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    message(`已删除用户编号为 ${getKeyList(curSelected, "id")} 的数据`, {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const res: any = await userListQuery({
      ...form,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    });
    dataList.value = res.data.list;
    pagination.total = res.data.total;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    form.deptId = null;
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ id, selected }) {
    form.deptId = selected ? id : null;
    onSearch();
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          id: row?.id ?? null,
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          positions: positionOptions.value ?? [], // 所有岗位列表
          primaryPositionId: row?.primaryPositionId ?? undefined, // 主岗位ID
          positionIds: row?.positionIds ?? [],
          deptIds: row?.departments?.map(dept => dept.id) ?? [],
          roleIds: row?.roles?.map(role => role.id) ?? [],
          nickname: row?.nickname ?? "",
          username: row?.username ?? "",
          password: row?.password ?? "",
          mobile: row?.mobile ?? "",
          email: row?.email ?? "",
          avatar: row?.avatar ?? "",
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;

        const submitData = {
          id: curData.id ?? null,
          username: curData.username,
          password: curData.password,
          nickname: curData.nickname,
          avatar: curData.avatar,
          email: curData.email,
          mobile: curData.mobile,
          status: curData.status,
          roleIds: curData.roleIds,
          deptIds: curData.deptIds,
          positionIds: curData.positionIds,
          primaryPositionId: curData.primaryPositionId
        };

        async function chores() {
          try {
            if (title === "新增") {
              await addUser(submitData);
            } else {
              await updateUser(submitData);
            }

            message(`${title}成功`, { type: "success" });
            done();

            setTimeout(() => {
              onSearch();
            }, 300);
          } catch (error) { }
        }

        FormRef.validate(valid => {
          if (valid) {
            chores(); // 执行异步操作
          }
        });
      }
    });
  }

  const cropRef = ref();
  /** 上传头像 */
  async function handleUpload(row) {
    addDialog({
      title: "裁剪、上传头像",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.avatar || userAvatar,
          onCropper: info => (avatarInfo.value = info)
        }),
      beforeSure: async (done) => {
        try {
          if (!avatarInfo.value?.blob) {
            message("请先裁剪图片", { type: "warning" });
            return;
          }

          const formData = new FormData();
          // 直接使用 blob，更简单可靠
          formData.append("file", avatarInfo.value.blob, `avatar_${row.id}.png`);
          formData.append("directory", "avatars");

          const { success, data } = await http.request<any>("post", "/upload/file", {
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (success) {
            await updateUser({ ...row, avatar: data });
            message("头像上传成功", { type: "success" });
            done();
            onSearch();
          }
        } catch (error) {
        }
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    addDialog({
      title: `重置 ${row.username} 用户的密码`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="newPwd"
              rules={[
                {
                  required: true,
                  message: "请输入新密码",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="请输入新密码"
              />
            </ElFormItem>
          </ElForm>
          <div class="mt-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div class="w-[19vw]" style={{ marginLeft: idx !== 0 ? "4px" : 0 }}>
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
      closeCallBack: () => (pwdForm.newPwd = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(async valid => {
          if (valid) {
            await updateUserPassword(row.id, pwdForm.newPwd);

            message(`已成功重置 ${row.username} 用户的密码`, {
              type: "success"
            });
            done(); // 关闭弹框

            setTimeout(() => {
              onSearch(); // 刷新表格数据
            }, 300);
          }
        });
      }
    });
  }

  /** 分配角色 */
  async function handleRole(row) {
    addDialog({
      title: `分配 ${row.username} 用户的角色`,
      props: {
        formInline: {
          username: row?.username ?? "",
          nickname: row?.nickname ?? "",
          roleOptions: roleOptions.value.map(role => ({
            id: role.id,
            roleKey: role.roleKey,
            roleName: role.roleName,
            status: role.status
          })),
          ids: row?.roles?.map(role => role.id) ?? []
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: async (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;
        await updateUserRole(row.id, curData.ids);
        message(`已成功分配 ${row.username} 用户的角色`, {
          type: "success"
        });
        done(); // 关闭弹框

        setTimeout(() => {
          onSearch(); // 刷新表格数据
        }, 300);
      }
    });
  }

  onMounted(async () => {
    treeLoading.value = true;
    onSearch();

    try {
      // 获取部门树
      const deptRes: any = await deptTreeQuery();
      higherDeptOptions.value = deptRes.data.departments;
      treeData.value = deptRes.data.departments;

      // 获取角色列表
      const roleRes = await roleListQuery({
        status: 1,
        page: 1,
        pageSize: 9999
      });
      roleOptions.value = roleRes.data.list;

      // 获取岗位列表
      const positionRes = await positionListQuery({
        status: 1,
        pageNum: 1,
        pageSize: 999
      });
      positionOptions.value = positionRes.data.list;
    } catch (error) {
    } finally {
      treeLoading.value = false;
    }
  });

  return {
    form,
    loading,
    columns,
    dataList,
    treeData,
    treeLoading,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleRole,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange,
    positionOptions
  };
}
