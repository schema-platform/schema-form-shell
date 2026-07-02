import { apiClient } from '@schema-platform/platform-shared/utils/apiClient'

export interface BusinessNotification {
  _id: string
  title: string
  content: string
  type: string
  isRead: boolean
  relatedId?: string
  relatedType?: string
  createdAt: string
}

export interface NotificationListResult {
  items: BusinessNotification[]
  total: number
  unreadCount: number
  publishedNotices?: number
}

export function fetchNotifications(params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
  const q = new URLSearchParams()
  if (params?.page != null) q.set('page', String(params.page))
  if (params?.pageSize != null) q.set('pageSize', String(params.pageSize))
  if (params?.unreadOnly) q.set('unreadOnly', 'true')
  const qs = q.toString()
  return apiClient.get<NotificationListResult>(`/business/notifications${qs ? `?${qs}` : ''}`)
}

export function fetchUnreadCount() {
  return apiClient.get<{ count: number }>('/business/notifications/unread-count')
}

export function markNotificationRead(id: string) {
  return apiClient.put(`/business/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return apiClient.put('/business/notifications/read-all')
}
