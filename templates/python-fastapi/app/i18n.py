from typing import Dict, Optional

translations: Dict[str, Dict[str, str]] = {
    "en": {
        "auth.login_success": "Login successful",
        "auth.register_success": "Registration successful",
        "auth.invalid_credentials": "Invalid email or password",
        "auth.token_expired": "Token has expired",
        "auth.unauthorized": "Unauthorized access",
        "validation.required": "{{field}} is required",
        "validation.min_length": "{{field}} must be at least {{min}} characters",
        "validation.email": "Invalid email format",
        "errors.not_found": "{{resource}} not found",
        "errors.server_error": "Internal server error",
        "common.success": "Success",
    },
    "zh": {
        "auth.login_success": "登录成功",
        "auth.register_success": "注册成功",
        "auth.invalid_credentials": "邮箱或密码错误",
        "auth.token_expired": "令牌已过期",
        "auth.unauthorized": "未授权访问",
        "validation.required": "{{field}}不能为空",
        "validation.min_length": "{{field}}至少需要{{min}}个字符",
        "validation.email": "邮箱格式不正确",
        "errors.not_found": "{{resource}}不存在",
        "errors.server_error": "服务器内部错误",
        "common.success": "成功",
    },
}

_current_locale = "en"


def set_locale(locale: str) -> None:
    """Set the current locale."""
    global _current_locale
    if locale in translations:
        _current_locale = locale


def get_locale() -> str:
    """Get the current locale."""
    return _current_locale


def get_accepted_language(accept_language: Optional[str]) -> str:
    """Determine language from Accept-Language header."""
    if not accept_language:
        return "en"
    if "zh" in accept_language.lower():
        return "zh"
    return "en"


def t(key: str, **params) -> str:
    """Translate a key to the current locale."""
    locale_dict = translations.get(_current_locale, translations["en"])
    text = locale_dict.get(key, key)

    if params:
        for param_key, value in params.items():
            text = text.replace(f"{{{{{param_key}}}}}", str(value))

    return text
