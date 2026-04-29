export const messages = {
  en: {
    auth: {
      loginSuccess: 'Login successful',
      loginFailed: 'Invalid credentials',
      registerSuccess: 'Registration successful',
      registerFailed: 'Registration failed',
      tokenExpired: 'Token has expired',
      tokenInvalid: 'Invalid token',
      unauthorized: 'Authentication required',
      forbidden: 'Access denied',
    },
    validation: {
      required: '{field} is required',
      invalidEmail: 'Invalid email address',
      minLength: '{field} must be at least {min} characters',
      maxLength: '{field} must not exceed {max} characters',
    },
    common: {
      notFound: '{resource} not found',
      created: '{resource} created successfully',
      updated: '{resource} updated successfully',
      deleted: '{resource} deleted successfully',
      serverError: 'Internal server error',
    },
  },
  zh: {
    auth: {
      loginSuccess: '登录成功',
      loginFailed: '凭证无效',
      registerSuccess: '注册成功',
      registerFailed: '注册失败',
      tokenExpired: '令牌已过期',
      tokenInvalid: '无效的令牌',
      unauthorized: '需要认证',
      forbidden: '访问被拒绝',
    },
    validation: {
      required: '{field} 是必填项',
      invalidEmail: '邮箱地址无效',
      minLength: '{field} 至少需要 {min} 个字符',
      maxLength: '{field} 不能超过 {max} 个字符',
    },
    common: {
      notFound: '未找到 {resource}',
      created: '{resource} 创建成功',
      updated: '{resource} 更新成功',
      deleted: '{resource} 删除成功',
      serverError: '服务器内部错误',
    },
  },
} as const;

type Locale = keyof typeof messages;
type MessageKey = keyof typeof messages.en;

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
  if (messages[locale]) {
    currentLocale = locale;
  }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = messages[currentLocale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English
      value = messages.en;
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key;
        }
      }
      break;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      value
    );
  }

  return value;
}

export function getAcceptedLanguage(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return 'en';

  const languages = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim().toLowerCase());

  for (const lang of languages) {
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('en')) return 'en';
  }

  return 'en';
}
