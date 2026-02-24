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
				<view class="nav-title">善行详情</view>
			</tn-nav-bar>
		</view>

		<view class="page-content" :style="{paddingTop: (vuex_custom_bar_height + 20) + 'px'}" v-if="diary">
			<!-- 主卡片 -->
			<view class="detail-card">
				<!-- 头部信息 -->
				<view class="card-header">
					<view class="type-badge" :style="{background: typeGradient(diary.deed_type)}">
						<text :class="[typeIcon(diary.deed_type)]"></text>
						<text class="type-name">{{ diary.deed_type }}</text>
					</view>
					<view class="merit-badge">
						<text class="merit-value">+{{ diary.merit_points }}</text>
						<text class="merit-label">功德</text>
					</view>
				</view>

				<!-- 标题 -->
				<view class="detail-title">{{ diary.title }}</view>

				<!-- 日期 -->
				<view class="detail-date">
					<text class="tn-icon-calendar"></text>
					<text>{{ diary.date }}</text>
				</view>

				<!-- 内容 -->
				<view class="detail-content" v-if="diary.content">
					<view class="content-label">
						<text class="tn-icon-text"></text>
						<text>详情</text>
					</view>
					<view class="content-text">{{ diary.content }}</view>
				</view>

				<!-- 发心与回甘 -->
				<view class="insight-section">
					<view class="insight-item" v-if="diary.intention">
						<view class="insight-header">
							<view class="insight-icon intention">
								<text class="tn-icon-heart"></text>
							</view>
							<text class="insight-label">发心</text>
						</view>
						<view class="insight-text">{{ diary.intention }}</view>
					</view>

					<view class="insight-item" v-if="diary.feeling">
						<view class="insight-header">
							<view class="insight-icon feeling">
								<text class="tn-icon-flower"></text>
							</view>
							<text class="insight-label">回甘</text>
						</view>
						<view class="insight-text">{{ diary.feeling }}</view>
					</view>
				</view>

				<!-- 公开状态 -->
				<view class="status-row">
					<text class="tn-icon-eye"></text>
					<text>{{ diary.is_public ? '已公开分享' : '仅自己可见' }}</text>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-section">
				<view class="edit-btn" @click="editDiary">
					<text class="tn-icon-edit"></text>
					<text>修改记录</text>
				</view>
				<view class="delete-btn" @click="deleteDiary">
					<text class="tn-icon-delete"></text>
					<text>删除记录</text>
				</view>
			</view>
		</view>

		<!-- 加载中 -->
		<view class="loading-state" v-else :style="{paddingTop: (vuex_custom_bar_height + 100) + 'px'}">
			<tn-loading mode="flower" color="#C9A86C"></tn-loading>
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script>
	import pageMixin from '@/libs/page-mixin'

	export default {
		mixins: [pageMixin],

		data() {
			return {
				id: '',
				diary: null
			}
		},
		methods: {
			onPageLoad(options) {
				if (options.id) {
					this.id = options.id;
				}
			},
			goBack() {
				uni.navigateBack();
			},
			async loadPageData() {
				const res = await this.$api.call('getDiaryDetail', {
					id: this.id
				}, {
					showLoading: true
				})

				if (res.success && res.data) {
					this.diary = res.data
				}
			},
			typeIcon(type) {
				const map = {
					'助人': 'tn-icon-peoples',
					'爱物': 'tn-icon-heart',
					'环保': 'tn-icon-leaf',
					'孝亲': 'tn-icon-home',
					'其他': 'tn-icon-star'
				};
				return map[type] || 'tn-icon-star';
			},
			typeGradient(type) {
				const map = {
					'助人': 'linear-gradient(135deg, #C9A86C, #D4B87A)',
					'爱物': 'linear-gradient(135deg, #E07A5F, #F09A7F)',
					'环保': 'linear-gradient(135deg, #3D8B8F, #5AABAD)',
					'孝亲': 'linear-gradient(135deg, #7B68EE, #9B8AFF)',
					'其他': 'linear-gradient(135deg, #636E72, #8395A7)'
				};
				return map[type] || 'linear-gradient(135deg, #636E72, #8395A7)';
			},
			editDiary() {
				// 跳转到创建页面，携带 ID 参数进入编辑模式
				uni.navigateTo({
					url: `/pages/diary/create?id=${this.id}`
				});
			},
			deleteDiary() {
				uni.showModal({
					title: '确认删除',
					content: '删除后将无法恢复，确定要删除这条善行记录吗？',
					confirmColor: '#E07A5F',
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '删除中'
							})

							const res = await this.$api.call('deleteDiary', {
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
	$primary: #3D8B8F;
	$accent: #C9A86C;
	$accent-light: #E8D4A8;
	$warm: #E07A5F;
	$bg: #F7F5F0;
	$card-bg: #FFFEFB;
	$text: #2D3436;
	$text-secondary: #636E72;
	$text-hint: #B2BEC3;

	.detail-page {
		min-height: 100vh;
		background-color: $bg;
	}

	.page-header {
		position: relative;
	}

	.header-bg {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 320rpx;
		background: linear-gradient(160deg, $accent 0%, #D4B87A 100%);
		z-index: 0;
	}

	.nav-back {
		display: flex;
		align-items: center;
		height: 100%;

		.back-btn {
			width: 64rpx;
			height: 64rpx;
			background: rgba(255, 255, 255, 0.25);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;

			text {
				color: #FFFFFF;
				font-size: 32rpx;
			}
		}
	}

	.nav-title {
		color: #FFFFFF;
		font-size: 34rpx;
		font-weight: bold;
		letter-spacing: 2rpx;
	}

	.page-content {
		position: relative;
		z-index: 1;
		padding: 0 30rpx 60rpx;
	}

	.detail-card {
		background: $card-bg;
		border-radius: 28rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.08);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.type-badge {
		display: flex;
		align-items: center;
		padding: 14rpx 28rpx;
		border-radius: 30rpx;

		text {
			color: #FFFFFF;

			&:first-child {
				font-size: 28rpx;
				margin-right: 10rpx;
			}
		}

		.type-name {
			font-size: 26rpx;
			font-weight: 500;
		}
	}

	.merit-badge {
		display: flex;
		flex-direction: column;
		align-items: center;

		.merit-value {
			font-size: 40rpx;
			font-weight: bold;
			color: $accent;
		}

		.merit-label {
			font-size: 22rpx;
			color: $text-hint;
		}
	}

	.detail-title {
		font-size: 40rpx;
		font-weight: bold;
		color: $text;
		line-height: 1.4;
		margin-bottom: 20rpx;
	}

	.detail-date {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: $text-secondary;
		margin-bottom: 30rpx;
		padding-bottom: 30rpx;
		border-bottom: 1rpx solid #F0EDE8;

		text:first-child {
			margin-right: 10rpx;
			color: $accent;
		}
	}

	.detail-content {
		margin-bottom: 30rpx;
	}

	.content-label {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		font-weight: 500;
		color: $text;
		margin-bottom: 16rpx;

		text:first-child {
			color: $accent;
			margin-right: 10rpx;
		}
	}

	.content-text {
		font-size: 30rpx;
		color: $text-secondary;
		line-height: 1.8;
		background: #F9F8F5;
		padding: 24rpx;
		border-radius: 16rpx;
	}

	.insight-section {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-bottom: 30rpx;
	}

	.insight-item {
		background: #F9F8F5;
		border-radius: 20rpx;
		padding: 24rpx;
	}

	.insight-header {
		display: flex;
		align-items: center;
		margin-bottom: 14rpx;
	}

	.insight-icon {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 14rpx;

		text {
			font-size: 26rpx;
			color: #FFFFFF;
		}

		&.intention {
			background: linear-gradient(135deg, $warm, #F09A7F);
		}

		&.feeling {
			background: linear-gradient(135deg, $primary, #5AABAD);
		}
	}

	.insight-label {
		font-size: 28rpx;
		font-weight: 500;
		color: $text;
	}

	.insight-text {
		font-size: 28rpx;
		color: $text-secondary;
		line-height: 1.6;
	}

	.status-row {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: $text-hint;

		text:first-child {
			margin-right: 10rpx;
		}
	}

	.action-section {
		margin-top: 40rpx;
		display: flex;
		gap: 20rpx;
	}

	.edit-btn {
		flex: 1;
		background: linear-gradient(135deg, $accent, #D4B87A);
		border-radius: 50rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			color: #FFFFFF;
			font-size: 28rpx;

			&:first-child {
				margin-right: 10rpx;
			}
		}

		&:active {
			opacity: 0.8;
		}
	}

	.delete-btn {
		flex: 1;
		background: #FFFEFB;
		border: 2rpx solid #FFE4E1;
		border-radius: 50rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		text {
			color: #E07A5F;
			font-size: 28rpx;

			&:first-child {
				margin-right: 10rpx;
			}
		}

		&:active {
			background: #FFF5F5;
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