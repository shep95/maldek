
export interface DbFunctions {
  delete_user_account: {
    Args: Record<PropertyKey, never>
    Returns: undefined
  }
  delete_user_data: {
    Args: Record<PropertyKey, never>
    Returns: undefined
  }
  increment_ad_click: {
    Args: {
      ad_id: string
    }
    Returns: undefined
  }
  increment_ad_view: {
    Args: {
      ad_id: string
    }
    Returns: undefined
  }
  process_content: {
    Args: {
      post_id: string
    }
    Returns: undefined
  }
  track_video_watch_time: {
    Args: {
      post_id: string
      watch_seconds: number
    }
    Returns: undefined
  }
}
