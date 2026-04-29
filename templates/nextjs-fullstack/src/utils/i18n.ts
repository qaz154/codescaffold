type TranslationKey = keyof typeof translations.en;

const translations = {
  en: {
    'auth.loginSuccess': 'Login successful',
    'auth.registerSuccess': 'Registration successful',
    'auth.invalidCredentials': 'Invalid email or password',
    'auth.tokenExpired': 'Token has expired',
    'auth.unauthorized': 'Unauthorized access',
    'validation.required': '{{field}} is required',
    'validation.minLength': '{{field}} must be at least {{min}} characters',
    'validation.maxLength': '{{field}} must be at most {{max}} characters',
    'validation.email': 'Invalid email format',
    'errors.notFound': '{{resource}} not found',
    'errors.serverError': 'Internal server error',
    'common.success': 'Success',
    'common.created': '{{resource}} created successfully',
    'common.updated': '{{resource}} updated successfully',
    'common.deleted': '{{resource}} deleted successfully',
  },
  zh: {
    'auth.loginSuccess': '登录成功',
    'auth.registerSuccess': '注册成功',
    'auth.invalidCredentials': '邮箱或密码错误',
    'auth.tokenExpired': '令牌已过期',
    'auth.unauthorized': '未授权访问',
    'validation.required': '{{field}}不能为空',
    'validation.minLength': '{{field}}至少需要{{min}}个字符',
    'validation.maxLength': '{{field}}最多{{max}}个字符',
    'validation.email': '邮箱格式不正确',
    'errors.notFound': '{{resource}}不存在',
    'errors.serverError': '服务器内部错误',
    'common.success': '成功',
    'common.created': '{{resource}}创建成功',
    'common.updated': '{{resource}}更新成功',
    'common.deleted': '{{resource}}删除成功',
  },
};

let currentLocale = 'en';

export function setLocale(locale: string): void {
  if (locale === 'zh' || locale === 'en') {
    currentLocale = locale;
  }
}

export function getLocale(): string {
  return currentLocale;
}

export function getAcceptedLanguage(acceptLanguage: string | undefined): string {
  if (!acceptLanguage) return 'en';

  if (acceptLanguage.includes('zh')) return 'zh';
  if (acceptLanguage.includes('en')) return 'en';

  return 'en';
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const locale = translations[currentLocale as keyof typeof translations] || translations.en;
  let text = (locale as Record<string, string>)[key] || key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    }
  }

  return text;
}
