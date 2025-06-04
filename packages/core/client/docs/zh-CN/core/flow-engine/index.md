# FlowEngine

`FlowEngine` 是 NocoBase 前端流程引擎的核心调度与管理类，专为前端流程自动化与业务逻辑编排设计。它负责流程模型（Model）与操作（Action）的注册、生命周期管理、持久化、远程同步等，为前端场景下的流程运行和扩展提供统一的环境与机制。

---

## 主要方法与属性

### Model 类注册与管理

- **registerModels(models: Record<string, ModelConstructor>): void**  
  批量注册模型类。

- **getModelClass(name: string): ModelConstructor | undefined**  
  获取已注册的模型类。

- **getModelClasses(): Map<string, ModelConstructor>**  
  获取所有已注册的模型类（构造函数）。返回一个 Map，key 为模型名称，value 为对应的模型类。常用于遍历、动态生成模型列表或批量操作等场景。
---

### Model 实例管理

- **createModel(options: CreateModelOptions): FlowModel**  
  创建并注册一个模型实例。如果指定 UID 已存在，则返回现有实例。

- **getModel(uid: string): FlowModel | undefined**  
  根据 UID 获取本地模型实例。

- **removeModel(uid: string): boolean**  
  销毁并移除一个本地模型实例。

---

### Model 持久化与远程操作

- **setModelRepository(modelRepository: IFlowModelRepository): void**  
  注入模型仓库（通常用于远程数据源/持久化适配器）。

- **async loadModel(uid: string): Promise<FlowModel \| null>**  
  从远程仓库加载模型数据，并创建本地实例。

- **async loadOrCreateModel(options: CreateModelOptions): Promise\<FlowModel\>**  
  从远程仓库加载模型，如果不存在则创建新模型实例并持久化。

- **async saveModel(model: FlowModel): Promise<any>**  
  保存模型到远程仓库。

- **async destroyModel(uid: string): Promise<boolean>**  
  从远程仓库删除模型，并移除本地实例。

---

### Action 注册与获取

- **registerAction(nameOrDefinition, options?): void**  
  注册一个 Action，可传入名称和选项，或完整的 ActionDefinition 对象。

- **getAction(name: string): ActionDefinition \| undefined**
  获取已注册的 Action 定义。

---

### formily 组件作用域管理

- **addComponents(components: Record<string, any>): void**
  注册 formily 组件到 FlowEngine 中，这些组件可以在后续 model 与 formily 结合使用。

- **components: Record<string, any>**
  获取所有已注册的组件。

- **addScopes(scopes: Record<string, any>): void**
  注册formily scopes到 FlowEngine 的中，这些 scopes 可以在后续 model 与 formily 结合使用。

- **scopes: Record<string, any>**
  获取所有已注册的scopes。

## 示例

<code src="./demos/quickstart.tsx"></code>
