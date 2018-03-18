/*
+-----------------------------------------------------------------------------------------------------------------------
| Author: 植成樑 <atzcl0310@gmail.com>  Blog：https://www.zcloop.com
+-----------------------------------------------------------------------------------------------------------------------
| 缓存管理
|
*/

import { isNull } from 'lodash'
import BaseHandler from '../base_class/base_handler'

export default class CacheManager extends BaseHandler {
  // 使用缓存类型 [ 以后拓展 ]
  private get store () {
    // return this.app['redis']
    return this.app.redis
  }

  /**
   * 给缓存标识添加 prefix 前缀
   *
   * @param {string} key 缓存标识
   * @returns {string}
   */
  public getPrefixKey (key: string): string {
    return `${this.app.config.name}_${key}`
  }

  /**
   * 设置字符串类型缓存
   *
   * @param {string} key 缓存标识
   * @param {string|number}    value 缓存的数据
   * @param {number} time 缓存过期时间
   * @param {string} unit 指定时间单位 （h/m/s/ms）默认为 s
   */
  public async set (
    key: string,
    value: string | number,
    time: number = 0,
    unit: string = 's'
  ) {
    if (isNull(key) || isNull(value)) {
      throw new Error('[cache]: 请传入正确参数')
    }

    if (!isNull(time)) {
      // 转换为小写
      unit = unit.toLowerCase()

      // 判断时间单位
      switch (unit) {
        case 'h':
          time *= 3600
          break
        case 'm':
          time *= 60
          break
        case 's':
          break
        case 'ms':
          break
        default:
          throw new Error('[cache]: 时间单位只能是：h/m/s/ms')
      }

      // EX: 单位为秒; PX: 单位为毫秒
      let mill = unit === 'ms' ? 'PX' : 'EX'

      return this.store.set(this.getPrefixKey(key), value, mill, time)
    }

    // 不设置过期时间
    return this.store.set(this.getPrefixKey(key), value)
  }

  /**
   * 获取缓存
   *
   * @param {string} key 缓存标识
   */
  public async get (key: string) {
    if (isNull(key)) {
      throw new Error('[cache]: 请传入需要获取的缓存名称')
    }

    try {
      return await this.store.get(this.getPrefixKey(key))
    } catch (error) {
      throw new Error('[cache]: get 方法只能获取 string 类型缓存')
    }
  }

  /**
   * 判断缓存是否存在
   *
   * @param {string} key
   * @returns {boolean}
   */
  public async has (key: string): Promise<boolean> {
    return !isNull(await this.get(key))
  }

  public async del (key: string) {
    if (isNull(key)) {
      throw new Error('[cache]: 请传入需要删除的缓存名称')
    }

    return this.store.del(this.getPrefixKey(key))
  }

  /**
   * 在列表右端插入数据(插入缓存列表尾部), 当缓存不存在的时候，一个空缓存会被创建并执行 rpush 操作
   *
   * @param key
   * @param value
   */
  public async pushListAfter (key: string, value: any) {
    return this.store.rpush(this.getPrefixKey(key), value)
  }

  /**
   * 在列表左端插入数据 (插入到缓存列表头部)
   *
   * @param key
   * @param value
   */
  public async pushListTop (key: string, value: any) {
    return this.store.lpush(this.getPrefixKey(key), value)
  }

  /**
   * rpushx 只对已存在的队列做添加, 当缓存不存在时，什么也不做
   *
   * @param key
   * @param value
   */
  public async rPushX (key: string, value: any) {
    return this.store.rpushx(this.getPrefixKey(key), value)
  }

  /**
   * 返回并移除缓存队列的第一个元素
   *
   * @param key
   */
  public async rmListTop (key: string) {
    return this.store.lpop(this.getPrefixKey(key))
  }

  /**
   * 返回并移除缓存队列的最后一个元素
   *
   * @param key
   */
  public async rmListAfter (key: string) {
    return this.store.rpop(this.getPrefixKey(key))
  }

  /**
   * 查看缓存队列长度
   *
   * @param key
   */
  public async getListLen (key: string) {
    return this.store.llen(this.getPrefixKey(key))
  }

  /**
   * 获取缓存列表中指定顺序位置的元素
   *
   * @param key
   * @param index 索引值
   */
  public async getListIndex (key: string, index: number) {
    return this.store.lindex(key, index)
  }

  /**
   * 修改缓存列表中指定顺序位置的元素值
   *
   * @param key
   * @param index
   * @param value
   */
  public async setListValue (key: string, index: number, value: any) {
    return this.store.lset(key, index, value)
  }
}