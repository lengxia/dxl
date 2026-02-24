/**
 * 列表页面公共 Mixin
 * 职责：
 * 1. 统一管理列表数据
 * 2. 分页加载（首次加载 + 加载更多）
 * 3. 下拉刷新支持
 * 4. 空状态和加载状态管理
 * 
 * 使用方式：
 * 1. 在子组件中定义 listKey（如 'notes'）指定数据字段名
 * 2. 在子组件中实现 fetchListData(params) 方法获取数据
 * 3. 在子组件中实现 onRefresh() 方法处理刷新后逻辑（可选）
 */
import pageMixin from './page-mixin.js';
export default {
  mixins: [pageMixin],
  data() {
    return {
      // 列表数据
      listData: [],
      
      // 分页控制
      pagination: {
        page: 1,
        pageSize: 10,
        hasMore: true,
        loading: false
      },
      
      // 刷新控制
      refreshing: false,
      
      // 自定义配置（子类可覆盖）
      listKey: 'listData',        // 列表数据的字段名
      enableLoadMore: true,       // 是否启用加载更多
      enablePullRefresh: true,    // 是否启用下拉刷新
      autoLoadOnShow: true        // onShow 时是否自动加载
    };
  },

  computed: {
    /**
     * 空状态判断
     */
    isEmpty() {
      return this.listData.length === 0;
    },

    /**
     * 加载状态判断
     */
    isLoading() {
      return this.pagination.loading;
    },

    /**
     * 加载更多状态判断
     */
    isLoadingMore() {
      return this.pagination.loading && this.pagination.page > 1;
    },

    /**
     * 下拉刷新状态
     */
    isRefreshing() {
      return this.refreshing;
    }
  },

  onShow() {
    // 自动加载数据
    if (this.autoLoadOnShow && this.isLogin) {
      this.loadListData();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    if (!this.enablePullRefresh) {
      uni.stopPullDownRefresh();
      return;
    }
    this.handlePullDownRefresh();
  },

  /**
   * 触底加载更多
   */
  onReachBottom() {
    if (!this.enableLoadMore) return;
    this.loadMoreData();
  },

  methods: {
    /**
     * 加载列表数据（首次加载/刷新）
     * 子类可覆盖此方法以添加额外参数
     */
    async loadListData() {
      if (this.pagination.loading) return;

      // 重置分页
      this.pagination.page = 1;
      this.pagination.hasMore = true;
      
      await this.fetchListData({ page: 1, refresh: true });
    },

    /**
     * 加载更多数据（分页）
     */
    async loadMoreData() {
      if (!this.enableLoadMore) return;
      if (this.pagination.loading) return;
      if (!this.pagination.hasMore) return;

      await this.fetchListData({ page: this.pagination.page + 1 });
    },

    /**
     * 获取列表数据（子类必须实现）
     * @param {Object} params - 参数 { page, refresh }
     * @returns {Promise<void>}
     */
    async fetchListData(params) {
      throw new Error('子类必须实现 fetchListData 方法');
    },

    /**
     * 处理下拉刷新
     * 子类可覆盖此方法以添加额外逻辑
     */
    async handlePullDownRefresh() {
      try {
        this.refreshing = true;
        this.pagination.page = 1;
        this.pagination.hasMore = true;
        
        await this.fetchListData({ page: 1, refresh: true });
        
        // 调用子类的刷新回调（可选）
        if (typeof this.onRefresh === 'function') {
          this.onRefresh();
        }
      } catch (error) {
        this.showError(error.message || '刷新失败');
      } finally {
        this.refreshing = false;
        uni.stopPullDownRefresh();
      }
    },

    /**
     * 通用列表数据设置（供 fetchListData 调用）
     * @param {Object} res - API 响应
     * @param {Object} options - 配置选项
     */
    setListData(res, options = {}) {
      const {
        listKey = this.listKey,
        dataPath = 'data',
        totalPath = 'total',
        hasMoreIndicator = (data, total) => data.length < total
      } = options;

      const data = res[dataPath] || [];
      const total = res[totalPath] || data.length;
      
      // 判断是否有更多数据
      const hasMore = hasMoreIndicator(data, total);
      
      // 设置数据
      if (this.pagination.page === 1) {
        this[listKey] = data;
      } else {
        // 合并已有数据
        this[listKey] = [...this[listKey], ...data];
      }
      
      // 更新分页状态
      this.pagination.hasMore = hasMore;
      this.pagination.loading = false;
    },

    /**
     * 设置加载状态
     * @param {boolean} loading - 是否加载中
     */
    setLoading(loading) {
      this.pagination.loading = loading;
    },

    /**
     * 刷新列表数据（对外暴露方法）
     */
    refreshList() {
      this.loadListData();
    },

    /**
     * 加载完成后的回调
     * 子类可覆盖此方法
     */
    onListLoaded() {
      // 可选：刷新完成后需要执行的操作
    },

    /**
     * 加载更多完成后的回调
     * 子类可覆盖此方法
     */
    onLoadMoreCompleted() {
      // 可选：加载更多完成后需要执行的操作
    }
  }
};