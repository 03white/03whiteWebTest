## ADDED Requirements

### Requirement: 画布缩放与平移
编辑器 SHALL 支持以光标为中心的缩放（滚轮）与画布平移（拖空白 / 空格拖拽），缩放范围与网格分档由 `configs/editor.json` 定义。

#### Scenario: 滚轮缩放
- **WHEN** 用户在画布上滚动滚轮
- **THEN** 画布以光标为中心缩放，且缩放比被约束在 `viewport.minZoom` 与 `viewport.maxZoom` 之间

#### Scenario: 拖拽平移
- **WHEN** 用户在空白区域拖拽
- **THEN** 画布随指针平移，且不选中任何节点

### Requirement: 节点增删改拖与多形状
编辑器 SHALL 支持创建、拖拽移动、选中、删除、编辑文本，并支持 `rect` / `rounded` / `diamond` / `ellipse` 四种预设形状（枚举由 `configs/editor.json` 定义）。

#### Scenario: 创建节点
- **WHEN** 用户在空白处创建节点
- **THEN** 生成一个使用 `defaultNode` 默认形状与尺寸的节点

#### Scenario: 拖动节点
- **WHEN** 用户拖动一个节点
- **THEN** 节点随指针移动，且与之相连的所有边实时跟随

#### Scenario: 删除节点
- **WHEN** 用户选中节点并删除
- **THEN** 该节点及其关联的边一并被移除

### Requirement: 连线（边）
编辑器 SHALL 支持从节点锚点拖出连线并连接到目标节点，边类型支持 `line` / `curve` / `orthogonal`，可带可选文本标签。

#### Scenario: 建立连线
- **WHEN** 用户从源节点锚点拖拽到目标节点并松开
- **THEN** 创建一条连接两节点的边，且随两端节点移动实时更新

### Requirement: 序列化与反序列化
编辑器 SHALL 能将图（节点 / 边 / 视口）序列化为符合 `graph.schema.json` 的 JSON，并能从合法 JSON 完整恢复；非法 JSON 应被拒绝。

#### Scenario: 保存并恢复
- **WHEN** 用户保存图为 JSON 后再次加载
- **THEN** 节点、边与视口被完整恢复

#### Scenario: 拒绝非法输入
- **WHEN** 加载的 JSON 不符合 `graph.schema.json`（如未知形状 / 缺字段）
- **THEN** 编辑器拒绝加载并给出错误提示

### Requirement: 撤销与重做
编辑器 SHALL 通过命令栈支持所有结构变更（增删节点 / 边、移动、改文本、粘贴等）的撤销（Ctrl/Cmd+Z）与重做（Ctrl/Cmd+Shift+Z 或 Ctrl+Y）。

#### Scenario: 撤销拖动
- **WHEN** 用户完成一次节点拖动后执行撤销
- **THEN** 节点回到拖动前位置，且拖动过程不被逐帧记录

### Requirement: 多选与复制粘贴
编辑器 SHALL 支持框选、追加点选、全选，以及对选中项的复制（Ctrl/Cmd+C）与粘贴（Ctrl/Cmd+V，粘贴位置偏移避免重叠）。

#### Scenario: 复制粘贴
- **WHEN** 用户复制选中的节点/边并粘贴
- **THEN** 生成偏移后的副本，且副本作为单一命令可被整体撤销

### Requirement: 导出图片
编辑器 SHALL 支持导出 SVG（矢量）与 PNG（位图），导出边界为内容包围盒加边距。

#### Scenario: 导出 SVG
- **WHEN** 用户导出 SVG
- **THEN** 得到包含全部图形且尺寸贴合内容的矢量文件

### Requirement: 资源单一源头与 harness 守门
编辑器的形状、尺寸、颜色、文案、交互状态与序列化契约 SHALL 均源自 `projects/assets/` 唯一源头；源头 schema 合法、序列化契约成立、产品 vendored 副本与源头无漂移，均须通过 harness 校验。

#### Scenario: 源头校验
- **WHEN** 运行 harness 校验（`pytest parity-tests/assets/ contracts/`）
- **THEN** 所有资源 schema 合法、契约示例通过、状态机语义自洽

#### Scenario: 副本漂移守门
- **WHEN** 产品 vendored 副本被直接篡改而与源头不一致
- **THEN** 漂移校验红灯，提示改源头并重跑 `sync-assets.sh`
