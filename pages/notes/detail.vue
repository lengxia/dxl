<template>
	<view class="detail-page">
		<!-- 顶部渐变背景 -->
		<view class="page-header">
			<view class="header-bg"></view>
			<tn-nav-bar :isBack="true" fixed customBack backgroundColor="transparent" :bottomShadow="false">
				<view slot="back" class="nav-back" @click="goBack">
					<view class="back-btn">
						<text class="tn-icon-left"></text>
					</view>
				</view>
				<!-- 移除标题，保持沉浸感 -->
				<view class="nav-title"></view>
			</tn-nav-bar>
		</view>

		<!-- 沉浸式内容区 -->
		<view class="page-content" v-if="note">
			<!-- 1. 图片轮播 (小红书风格) -->

			<tn-swiper :list="note.images" height=650 ></tn-swiper>

			<!-- 2. 内容区域 -->
			<view class="content-body" :class="{ 'no-image': !note.images || note.images.length === 0 }">

				<!-- 标题 -->
				<view class="note-title">{{ note.title }}</view>

				<!-- 信息栏：日期 & 隐私状态 -->
				<view class="note-meta">
					<view class="meta-left">
						<text class="meta-date">{{ formatDate(note.create_time) }}</text>
						<view class="privacy-tag" v-if="note.is_private">
							<text class="tn-icon-lock"></text>
							<text>私密</text>
						</view>
					</view>

					<!-- 心境作为标签展示 -->
					<view class="mood-tag">
						<text class="mood-emoji">{{ moodEmoji(note.mood) }}</text>
						<text class="mood-text">{{ note.mood }}</text>
					</view>
				</view>

				<!-- 正文 (支持富文本) -->
				<view class="note-text rich-text-content" v-html="note.content"></view>

				<!-- 底部标签 -->
				<view class="note-tags" v-if="note.tags && note.tags.length > 0">
					<view v-for="(tag, i) in note.tags" :key="i" class="hash-tag">
						# {{ tag }}
					</view>
				</view>

				<!-- 底部留白，防止被操作栏遮挡 -->
				<view style="height: 120rpx;"></view>
			</view>

			<!-- 3. 底部固定操作栏 -->
			<view class="bottom-bar tn-safe-area-inset-bottom">
				<view class="action-btn-group">
					<view class="btn-item edit-btn" @click="editNote">
						<text class="tn-icon-edit"></text>
						<text>编辑</text>
					</view>
					<view class="btn-item delete-btn" @click="deleteNote">
						<text class="tn-icon-delete"></text>
						<text>删除</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载中 -->
		<view class="loading-state" v-else :style="{paddingTop: (vuex_custom_bar_height + 100) + 'px'}">
			<tn-loading mode="flower" color="#7B68EE"></tn-loading>
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script>
	import pageMixin from '@/libs/page-mixin'
	import {
		unescapeHtml
	} from '@/libs/html-utils'
	import {
		formatDate
	} from '@/libs/date-utils'
	import notesState from '@/store/node_state.js'

	export default {
		mixins: [pageMixin],

		data() {
			return {
				id: '',
				note: null,
				currentImageIndex: 0
			}
		},
		onLoad(options) {
			if (options.id) {
				this.id = options.id;
				// 检查状态中是否有匹配的 note
				if (notesState.isCurrentNote(this.id)) {
					const data = notesState.currentNote;
					if (data.content) {
						data.content = unescapeHtml(data.content);
					}
					this.note = data;
				} else {
					this.loadData();
				}
			}
		},
		methods: {
			onPageShow() {
				// 检查状态中是否有更新的 note（编辑返回时）
				if (notesState.isCurrentNote(this.id)) {
					const data = notesState.currentNote;
					if (data.content) {
						data.content = unescapeHtml(data.content);
					}
					this.note = data;
					return;
				}
				// 其他情况正常加载数据
				if (this.id) {
					this.loadData();
				}
			},
			goBack() {
				uni.navigateBack();
			},
			async loadData() {
				const res = await this.$api.call('getNoteDetail', {
					id: this.id
				}, {
					showLoading: true
				})
				if (res.success && res.data) {
					const data = res.data
					// HTML 反转义
					if (data.content) {
						data.content = unescapeHtml(data.content)
					}
					this.note = data
				}
			},
			moodEmoji(mood) {
				const map = {
					'平和': '😌',
					'喜悦': '😊',
					'感悟': '💡',
					'焦虑': '😰',
					'低落': '😔'
				};
				return map[mood] || '😌';
			},
			formatDate(timestamp) {
				return formatDate(timestamp, 'datetime')
			},
			previewImage(current) {
				uni.previewImage({
					current: current,
					urls: this.note.images
				});
			},
			onSwiperChange(e) {
				this.currentImageIndex = e.detail.current;
			},
			editNote() {
				// 将当前 note 保存到状态
				if (this.note) {
					notesState.setCurrentNote(this.note);
				}
				// 跳转到创建页面，携带 ID 参数进入编辑模式
				uni.navigateTo({
					url: `/pages/notes/create?id=${this.id}`
				});
			},
			deleteNote() {
				uni.showModal({
					title: '确认删除',
					content: '删除后将无法恢复，确定要删除这条札记吗？',
					confirmColor: '#E07A5F',
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '删除中'
							})

							const res = await this.$api.call('deleteNote', {
								id: this.id
							}, {
								showLoading: false
							})

							uni.hideLoading()

							if (res.success) {
								uni.showToast({
									title: '已删除',
									icon: 'success'
								})
								setTimeout(() => {
									uni.navigateBack()
								}, 1500)
							} else {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								})
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #7B68EE;
	$primary-light: #9B8AFF;
	$accent: #C9A86C;
	$warm: #E07A5F;
	$bg: #F7F5F0;
	$card-bg: #FFFEFB;
	$text: #2D3436;
	$text-secondary: #636E72;
	$text-hint: #B2BEC3;

	.detail-page {
		min-height: 100vh;
		background-color: #FFFFFF; // 改为纯白背景
	}

	.page-header {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
	}

	// 导航栏透明渐变逻辑需要结合 onPageScroll 实现，这里简化为固定样式
	.nav-back {
		display: flex;
		align-items: center;
		height: 100%;
		margin-left: 20rpx;

		.back-btn {
			width: 64rpx;
			height: 64rpx;
			background: rgba(0, 0, 0, 0.3); // 半透明黑底，适应图片背景
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			backdrop-filter: blur(10px);

			text {
				color: #FFFFFF;
				font-size: 36rpx;
			}
		}
	}

	.page-content {
		padding-bottom: 120rpx;
	}

	// 1. 轮播图样式
	.swiper-container {
		width: 100%;
		height: 65vh; // 稍微增加高度
		background-color: #F5F5F5;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 120rpx;
			background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.2));
			pointer-events: none;
		}
	}

	.image-swiper {
		width: 100%;
		height: 100%;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	.image-mask {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 60rpx;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
		pointer-events: none;
	}

	.image-indicator {
		position: absolute;
		bottom: 40rpx; // 距离底部有一定距离，避开圆角区域
		right: 30rpx;
		background: rgba(0, 0, 0, 0.4);
		color: #FFFFFF;
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		backdrop-filter: blur(4px);
		z-index: 20;
		font-weight: 500;
		letter-spacing: 1rpx;
	}

	// 2. 内容区样式
	.content-body {
		padding: 40rpx 40rpx 0;
		background-color: #FFFFFF;
		border-radius: 40rpx 40rpx 0 0; // 更大的圆角
		margin-top: -40rpx; // 更多的重叠
		position: relative;
		z-index: 10;
		min-height: 40vh;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.03); // 顶部轻微阴影

		&.no-image {
			margin-top: 180rpx; // 无图时向下偏移
			box-shadow: none;
		}
	}

	// 装饰性把手
	.drawer-handle {
		width: 80rpx;
		height: 8rpx;
		background-color: #E0E0E0;
		border-radius: 4rpx;
		margin: -10rpx auto 30rpx;
		opacity: 0.8;
	}

	.note-title {
		font-size: 40rpx; // 更大的标题
		font-weight: 700;
		color: #1A1A1A;
		line-height: 1.4;
		margin-bottom: 24rpx;
		letter-spacing: -0.5rpx;
	}

	.note-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
		padding-bottom: 30rpx;
		border-bottom: 1rpx solid rgba(0, 0, 0, 0.03); // 增加分割线

		.meta-left {
			display: flex;
			align-items: center;

			.meta-date {
				font-size: 26rpx;
				color: #999;
				margin-right: 20rpx;
				font-family: Arial, sans-serif; // 数字用无衬线字体更好看
			}

			.privacy-tag {
				font-size: 20rpx;
				color: $text-secondary;
				background: #F0F2F5;
				padding: 4rpx 12rpx;
				border-radius: 6rpx;
				display: flex;
				align-items: center;

				text:first-child {
					margin-right: 6rpx;
					font-size: 22rpx;
				}
			}
		}

		.mood-tag {
			font-size: 24rpx;
			color: #FFFFFF;
			background: linear-gradient(135deg, $primary-light, $primary); // 渐变背景
			padding: 8rpx 24rpx;
			border-radius: 30rpx;
			display: flex;
			align-items: center;
			box-shadow: 0 4rpx 10rpx rgba($primary, 0.2);

			.mood-emoji {
				margin-right: 8rpx;
				font-size: 28rpx;
			}

			.mood-text {
				font-weight: 500;
				letter-spacing: 1rpx;
			}
		}
	}

	.note-text {
		font-size: 32rpx; // 稍微加大正文字号，提升阅读舒适度
		color: #333;
		line-height: 1.85; // 增加行高
		margin-bottom: 50rpx;
		letter-spacing: 0.5rpx;
		text-align: justify; // 两端对齐

		&.rich-text-content {

			// 富文本样式重置
			:deep(p) {
				margin: 0 0 20rpx 0;
				line-height: 1.8;
			}

			:deep(h1) {
				font-size: 40rpx;
				font-weight: bold;
				margin: 30rpx 0 20rpx 0;
				line-height: 1.4;
			}

			:deep(h2) {
				font-size: 36rpx;
				font-weight: bold;
				margin: 25rpx 0 15rpx 0;
				line-height: 1.4;
			}

			:deep(strong) {
				font-weight: 700;
				color: $text;
			}

			:deep(em) {
				font-style: italic;
			}

			:deep(u) {
				text-decoration: underline;
			}

			:deep(s) {
				text-decoration: line-through;
			}

			:deep(ul) {
				margin: 15rpx 0;
				padding-left: 40rpx;

				li {
					margin: 8rpx 0;
					list-style-type: disc;
				}
			}

			:deep(ol) {
				margin: 15rpx 0;
				padding-left: 40rpx;

				li {
					margin: 8rpx 0;
					list-style-type: decimal;
				}
			}

			:deep(blockquote) {
				border-left: 4rpx solid $primary;
				padding-left: 20rpx;
				margin: 20rpx 0;
				color: $text-secondary;
				font-style: italic;
			}

			:deep(hr) {
				border: none;
				border-top: 2rpx solid #E8E8E8;
				margin: 30rpx 0;
			}

			:deep(a) {
				color: $primary;
				text-decoration: underline;
			}
		}
	}

	.note-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 40rpx;
	}

	.hash-tag {
		font-size: 26rpx;
		color: #1E80FF; // 话题蓝
		font-weight: 500;
	}

	// 3. 底部操作栏
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.95); // 增加透明度
		backdrop-filter: blur(20px); // 毛玻璃效果
		border-top: 1rpx solid rgba(0, 0, 0, 0.05);
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 99;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05); // 增加上浮阴影
	}

	.action-btn-group {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 30rpx;
	}

	.btn-item {
		flex: 1;
		height: 84rpx;
		border-radius: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 500;
		transition: all 0.2s;

		text:first-child {
			font-size: 34rpx;
			margin-right: 12rpx;
		}

		&:active {
			transform: scale(0.98);
		}
	}

	.edit-btn {
		background: linear-gradient(135deg, $primary-light, $primary);
		color: #FFFFFF;
		box-shadow: 0 8rpx 20rpx rgba($primary, 0.25);
	}

	.delete-btn {
		background: #FFF5F5;
		color: $warm;

		&:active {
			background: #FFE0E0;
		}
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.loading-text {
			margin-top: 20rpx;
			font-size: 28rpx;
			color: $text-hint;
		}
	}
</style>