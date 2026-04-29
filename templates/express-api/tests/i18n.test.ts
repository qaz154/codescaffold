import { describe, it, expect } from 'vitest';
import { t, setLocale, getLocale, getAcceptedLanguage } from '../src/utils/i18n';

describe('i18n', () => {
  describe('t()', () => {
    it('should translate auth.loginSuccess in English', () => {
      setLocale('en');
      expect(t('auth.loginSuccess')).toBe('Login successful');
    });

    it('should translate auth.loginSuccess in Chinese', () => {
      setLocale('zh');
      expect(t('auth.loginSuccess')).toBe('登录成功');
    });

    it('should replace parameters', () => {
      setLocale('en');
      expect(t('validation.minLength', { field: 'Password', min: 8 }))
        .toBe('Password must be at least 8 characters');
    });

    it('should return key if translation not found', () => {
      setLocale('en');
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });
  });

  describe('setLocale() and getLocale()', () => {
    it('should set and get locale', () => {
      setLocale('zh');
      expect(getLocale()).toBe('zh');

      setLocale('en');
      expect(getLocale()).toBe('en');
    });

    it('should not set invalid locale', () => {
      setLocale('en');
      // @ts-ignore - testing invalid input
      setLocale('invalid');
      expect(getLocale()).toBe('en');
    });
  });

  describe('getAcceptedLanguage()', () => {
    it('should return en for English accept-language', () => {
      expect(getAcceptedLanguage('en-US')).toBe('en');
      expect(getAcceptedLanguage('en')).toBe('en');
    });

    it('should return zh for Chinese accept-language', () => {
      expect(getAcceptedLanguage('zh-CN')).toBe('zh');
      expect(getAcceptedLanguage('zh')).toBe('zh');
    });

    it('should return en for undefined', () => {
      expect(getAcceptedLanguage(undefined)).toBe('en');
    });

    it('should prioritize zh over en', () => {
      expect(getAcceptedLanguage('zh-CN, en-US')).toBe('zh');
    });
  });
});
