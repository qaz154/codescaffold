package i18n

import (
	"fmt"
	"strings"
)

type TranslationFunc func(key string, params ...string) string

var translations = map[string]map[string]string{
	"en": {
		"auth.login_success":         "Login successful",
		"auth.register_success":      "Registration successful",
		"auth.invalid_credentials":   "Invalid email or password",
		"auth.token_expired":        "Token has expired",
		"auth.unauthorized":         "Unauthorized access",
		"validation.required":        "{{field}} is required",
		"validation.min_length":      "{{field}} must be at least {{min}} characters",
		"validation.email":          "Invalid email format",
		"errors.not_found":          "{{resource}} not found",
		"errors.server_error":       "Internal server error",
		"common.success":            "Success",
	},
	"zh": {
		"auth.login_success":         "登录成功",
		"auth.register_success":      "注册成功",
		"auth.invalid_credentials":   "邮箱或密码错误",
		"auth.token_expired":        "令牌已过期",
		"auth.unauthorized":         "未授权访问",
		"validation.required":        "{{field}}不能为空",
		"validation.min_length":      "{{field}}至少需要{{min}}个字符",
		"validation.email":          "邮箱格式不正确",
		"errors.not_found":          "{{resource}}不存在",
		"errors.server_error":       "服务器内部错误",
		"common.success":           "成功",
	},
}

var currentLocale = "en"

// SetLocale sets the current locale
func SetLocale(locale string) {
	if _, ok := translations[locale]; ok {
		currentLocale = locale
	}
}

// GetLocale returns the current locale
func GetLocale() string {
	return currentLocale
}

// GetAcceptedLanguage determines language from Accept-Language header
func GetAcceptedLanguage(acceptLanguage string) string {
	if acceptLanguage == "" {
		return "en"
	}
	if strings.Contains(strings.ToLower(acceptLanguage), "zh") {
		return "zh"
	}
	return "en"
}

// T translates a key with optional parameters
func T(key string, params ...string) string {
	localeDict, ok := translations[currentLocale]
	if !ok {
		localeDict = translations["en"]
	}

	text, ok := localeDict[key]
	if !ok {
		return key
	}

	for i := 0; i < len(params)-1; i += 2 {
		placeholder := fmt.Sprintf("{{{%s}}}", params[i])
		text = strings.ReplaceAll(text, placeholder, params[i+1])
	}

	return text
}
