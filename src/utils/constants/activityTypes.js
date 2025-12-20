// Activity types for user activity logging
export const ACTIVITY_TYPES = {
  VIEW_LISTING_DETAIL: 'view_listing_detail',
  INITIATE_CHAT: 'initiate_chat'
};

// Target types for activity logging
export const TARGET_TYPES = {
  LISTING: 'listing',
  USER: 'user',
  CATEGORY: 'category'
};

// Referrer sources for tracking how users arrived at listings
export const REFERRER_SOURCES = {
  SEARCH_RESULTS: 'search_results',
  CATEGORY_PAGE: 'category_page',
  DIRECT_LINK: 'direct_link',
  FAVORITES: 'favorites',
  EXTERNAL: 'external',
  RECOMMENDATION: 'recommendation'
};

// Chat button locations for tracking where users initiate chat
export const CHAT_BUTTON_LOCATIONS = {
  LISTING_HEADER: 'listing_header',
  LISTING_FOOTER: 'listing_footer',
  CONTACT_SECTION: 'contact_section',
  FLOATING_BUTTON: 'floating_button'
};