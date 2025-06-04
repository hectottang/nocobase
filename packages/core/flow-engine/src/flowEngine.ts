/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { connect, mapProps } from '@formily/react';
import { Switch } from 'antd';
import { FlowModel } from './models';
import {
  ActionDefinition,
  ActionOptions,
  CreateModelOptions,
  FlowDefinition,
  IFlowModelRepository,
  ModelConstructor,
} from './types';

// 创建 NocoBase 兼容的 Switch 组件
const NocoBaseSwitch = connect(
  Switch,
  mapProps({
    value: 'checked',
    onInput: 'onChange',
  }),
);

interface ApplyFlowCacheEntry {
  status: 'pending' | 'resolved' | 'rejected';
  promise: Promise<any>;
  data?: any;
  error?: any;
}

export class FlowEngine {
  /** @private Stores registered action definitions. */
  private actions: Map<string, ActionDefinition> = new Map();
  /** @private Stores registered model constructors. */
  private modelClasses: Map<string, ModelConstructor> = new Map();
  /** @private Stores created model instances. */
  private modelInstances: Map<string, any> = new Map();
  /** @public Stores registered components for SchemaComponent. */
  public components: Record<string, any> = {};
  /** @public Stores registered scopes for SchemaComponent. */
  public scopes: Record<string, any> = {};
  context: Record<string, any> = {};
  private modelRepository: IFlowModelRepository | null = null;
  private _applyFlowCache = new Map<string, ApplyFlowCacheEntry>();

<<<<<<< HEAD
=======
  constructor() {
    // 注册默认组件
    this.addComponents({
      Switch: NocoBaseSwitch,
    });
  }

>>>>>>> event-filter
  setModelRepository(modelRepository: IFlowModelRepository) {
    if (this.modelRepository) {
      console.warn('FlowEngine: Model repository is already set and will be overwritten.');
    }
    this.modelRepository = modelRepository;
  }

  setContext(context: any) {
    this.context = context;
  }

  getContext() {
    return this.context;
  }

  get applyFlowCache() {
    return this._applyFlowCache;
  }

<<<<<<< HEAD
=======
  /**
   * 添加组件到 FlowEngine 的组件注册表中。
   * 这些组件可以在 SchemaComponent 中使用。
   * @param {Record<string, any>} components 要添加的组件对象
   * @returns {void}
   * @example
   * flowEngine.addComponents({ MyComponent, AnotherComponent });
   */
  public addComponents(components: Record<string, any>): void {
    Object.keys(components).forEach((name) => {
      if (this.components[name]) {
        console.warn(`FlowEngine: Component with name '${name}' is already registered and will be overwritten.`);
      }
      this.components[name] = components[name];
    });
  }

  /**
   * 添加作用域到 FlowEngine 的作用域注册表中。
   * 这些作用域可以在 SchemaComponent 中使用。
   * @param {Record<string, any>} scopes 要添加的作用域对象
   * @returns {void}
   * @example
   * flowEngine.addScopes({ useMyHook, myVariable, myFunction });
   */
  public addScopes(scopes: Record<string, any>): void {
    Object.keys(scopes).forEach((name) => {
      if (this.scopes[name]) {
        console.warn(`FlowEngine: Scope with name '${name}' is already registered and will be overwritten.`);
      }
      this.scopes[name] = scopes[name];
    });
  }

>>>>>>> event-filter
  /**
   * 注册一个 Action。支持泛型以确保正确的模型类型推导。
   * Action 是流程中的可复用操作单元。
   * @template TModel 具体的FlowModel子类类型
   * @param {string | ActionDefinition<TModel>} nameOrDefinition Action 名称或 ActionDefinition 对象。
   *        如果为字符串，则为 Action 名称，需要配合 options 参数。
   *        如果为对象，则为完整的 ActionDefinition。
   * @param {ActionOptions<TModel>} [options] 当第一个参数为 Action 名称时，此参数为 Action 的选项。
   * @returns {void}
   * @example
   * // 方式一: 传入名称和选项
   * flowEngine.registerAction<MyModel>('myAction', { handler: async (ctx, params) => { ... } });
   * // 方式二: 传入 ActionDefinition 对象
   * flowEngine.registerAction<MyModel>({ name: 'myAction', handler: async (ctx, params) => { ... } });
   */
  public registerAction<TModel extends FlowModel = FlowModel>(
    nameOrDefinition: string | ActionDefinition<TModel>,
    options?: ActionOptions<TModel>,
  ): void {
    let definition: ActionDefinition<TModel>;

    if (typeof nameOrDefinition === 'string' && options) {
      definition = {
        ...options,
        name: nameOrDefinition,
      };
    } else if (typeof nameOrDefinition === 'object') {
      definition = nameOrDefinition as ActionDefinition<TModel>;
    } else {
      throw new Error('Invalid arguments for registerAction');
    }

    if (this.actions.has(definition.name)) {
      console.warn(`FlowEngine: Action with name '${definition.name}' is already registered and will be overwritten.`);
    }
    this.actions.set(definition.name, definition as ActionDefinition);
  }

  /**
   * 获取已注册的 Action 定义。
   * @template TModel 具体的FlowModel子类类型
   * @param {string} name Action 名称。
   * @returns {ActionDefinition<TModel> | undefined} Action 定义，如果未找到则返回 undefined。
   */
  public getAction<TModel extends FlowModel = FlowModel>(name: string): ActionDefinition<TModel> | undefined {
    return this.actions.get(name) as ActionDefinition<TModel> | undefined;
  }

  /**
   * 注册一个 Model 类。
   * Model 类用于创建和管理流程中的数据状态。
   * @param {string} name Model 类名称。
   * @param {ModelConstructor} modelClass Model 构造函数。
   * @returns {void}
   * @example
   * class MyModel extends FlowModel {}
   * flowEngine.registerModelClass('MyModel', MyModel);
   */
  public registerModelClass(name: string, modelClass: ModelConstructor): void {
    if (this.modelClasses.has(name)) {
      console.warn(`FlowEngine: Model class with name '${name}' is already registered and will be overwritten.`);
    }
    this.modelClasses.set(name, modelClass);
  }

  public registerModels(models: Record<string, ModelConstructor>) {
    for (const [name, modelClass] of Object.entries(models)) {
      this.registerModelClass(name, modelClass);
    }
  }

  getModelClasses() {
    return this.modelClasses;
  }

  /**
   * 获取已注册的 Model 类 (构造函数)。
   * @param {string} name Model 类名称。
   * @returns {ModelConstructor | undefined} Model 构造函数，如果未找到则返回 undefined。
   */
  public getModelClass(name: string): ModelConstructor | undefined {
    return this.modelClasses.get(name);
  }

  /**
   * 创建并注册一个 Model 实例。
   * 如果具有相同 UID 的实例已存在，则返回现有实例。
   * @template T FlowModel 的子类型，默认为 FlowModel。
   * @param {CreateModelOptions} options 创建模型的选项
   * @returns {T} 创建的 Model 实例。
   */
  public createModel<T extends FlowModel = FlowModel>(options: CreateModelOptions): T {
    const { parentId, uid, use: modelClassName } = options;
    const ModelClass = this.getModelClass(modelClassName);

    if (!ModelClass) {
      throw new Error(`Model class '${modelClassName}' not found. Please register it first.`);
    }

    if (uid && this.modelInstances.has(uid)) {
      return this.modelInstances.get(uid) as T;
    }

    const modelInstance = new (ModelClass as ModelConstructor<T>)(options as any);

    modelInstance.setFlowEngine(this);
    modelInstance.onInit(options);

    if (parentId && this.modelInstances.has(parentId)) {
      modelInstance.setParent(this.modelInstances.get(parentId));
    }

    this.modelInstances.set(modelInstance.uid, modelInstance);

    return modelInstance;
  }

  /**
   * 根据 UID 获取 Model 实例。
   * @template T FlowModel 的子类型，默认为 FlowModel。
   * @param {string} uid Model 实例的唯一标识符。
   * @returns {T | undefined} Model 实例，如果未找到则返回 undefined。
   */
  public getModel<T extends FlowModel = FlowModel>(uid: string): T | undefined {
    return this.modelInstances.get(uid) as T | undefined;
  }

  /**
   * 销毁并移除一个 Model 实例。
   * @param {string} uid 要销毁的 Model 实例的唯一标识符。
   * @returns {boolean} 如果成功销毁则返回 true，否则返回 false (例如，实例不存在)。
   */
  public removeModel(uid: string): boolean {
    if (this.modelInstances.has(uid)) {
      return this.modelInstances.delete(uid);
    }
    return false;
  }

  private ensureModelRepository(): boolean {
    if (!this.modelRepository) {
      // 不抛错，直接返回 false
      return false;
    }
    return true;
  }

  async loadModel<T extends FlowModel = FlowModel>(uid: string): Promise<T | null> {
    if (!this.ensureModelRepository()) return;
    const data = await this.modelRepository.load(uid);
    return data?.uid ? this.createModel<T>(data as any) : null;
  }

  async loadOrCreateModel<T extends FlowModel = FlowModel>(options): Promise<T | null> {
    if (!this.ensureModelRepository()) return;
    const data = await this.modelRepository.load(options.uid);
    if (data?.uid) {
      return this.createModel<T>(data as any);
    } else {
      const model = this.createModel<T>(options);
      await model.save();
      return model;
    }
  }

  async saveModel<T extends FlowModel = FlowModel>(model: T) {
    if (!this.ensureModelRepository()) return;
    return await this.modelRepository.save(model);
  }

  async destroyModel(uid: string) {
    if (this.ensureModelRepository()) {
      await this.modelRepository.destroy(uid);
    }
    return this.removeModel(uid);
  }

  /**
   * 注册一个流程 (Flow)。支持泛型以确保正确的模型类型推导。
   * 流程是一系列步骤的定义，可以由事件触发或手动应用。
   * @template TModel 具体的FlowModel子类类型
   * @param {string} modelClassName 模型类名称。
   * @param {FlowDefinition<TModel>} flowDefinition 流程定义。
   * @returns {void}
   */
  public registerFlow<TModel extends FlowModel = FlowModel>(
    modelClassName: string,
    flowDefinition: FlowDefinition<TModel>,
  ): void {
    const ModelClass = this.getModelClass(modelClassName);

    // 检查ModelClass是否存在
    if (!ModelClass) {
      console.warn(
        `FlowEngine: Model class '${modelClassName}' not found. Flow '${flowDefinition.key}' will not be registered.`,
      );
      return;
    }

    if (typeof (ModelClass as any).registerFlow !== 'function') {
      console.warn(
        `FlowEngine: Model class '${modelClassName}' does not have a static registerFlow method. Flow '${flowDefinition.key}' will not be registered.`,
      );
      return;
    }

    (ModelClass as any).registerFlow(flowDefinition);
  }
}
